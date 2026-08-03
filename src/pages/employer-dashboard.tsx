import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileMe } from "@/hooks/use-profile-me";
import { useAllEmployerJobOffers } from "@/hooks/use-employer-job-offers";
import { useEmployerApplications } from "@/hooks/use-employer-applications";
import { useProfileInvoices } from "@/hooks/use-profile-invoices";
import {
  FillRateMeter,
  OfferStageBar,
  SpendChart,
} from "@/features/employer/components/dashboard-charts";
import {
  countByStage,
  fillRate,
  monthlySpend,
} from "@/features/employer/config/dashboard-metrics";

import { useNavigate } from "react-router";
import {
  Briefcase,
  Users,
  Wallet,
  FileText,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

/** Matches the offers limit: the pending count is an aggregate, not a page. */
const DASHBOARD_APPLICATIONS_LIMIT = 100;

function KpiCard({
  label,
  value,
  icon: Icon,
  loading,
}: Readonly<{
  label: string;
  value: string | number;
  icon: React.ElementType;
  loading?: boolean;
}>) {
  return (
    <div className="bg-card shadow-soft rounded-xl p-3 flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-4 text-primary" />
      </div>
      <div className="min-w-0">
        {loading ? (
          <Skeleton className="h-5 w-14 mb-1" />
        ) : (
          <p className="text-lg font-bold leading-tight text-foreground break-words">
            {value}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground leading-tight">
          {label}
        </p>
      </div>
    </div>
  );
}

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfileMe();
  // Full sets, not a first page: every figure and chart below is an aggregate,
  // and counting a 5-item page silently capped each of them at 5.
  const { data: jobOffers, isLoading: jobsLoading } = useAllEmployerJobOffers();
  const { data: applications, isLoading: appsLoading } =
    useEmployerApplications(1, DASHBOARD_APPLICATIONS_LIMIT);
  const { data: invoices, isLoading: invoicesLoading } = useProfileInvoices();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  if (!profileLoading && profile?.profileType !== "EMPLOYER") {
    navigate("/profile");
    return null;
  }

  const offers = jobOffers?.data ?? [];

  const activeJobsCount = offers.filter((j) =>
    ["ACTIVE", "PARTIALLY_FILLED", "FILLED", "IN_PROGRESS"].includes(j.status),
  ).length;

  const pendingAppsCount =
    applications?.data.filter((a) =>
      ["PENDING", "VIEWED"].includes(a.status),
    ).length ?? 0;

  const walletBalance = profile?.walletBalance ?? 0;
  const invoiceCount = invoices?.length ?? 0;

  const stageCounts = countByStage(offers);
  const rate = fillRate(offers);
  const spend = monthlySpend(invoices ?? []);

  return (
    <div className="pt-8 lg:pt-10 pb-12 px-4 md:px-8 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          label="Offres actives"
          value={activeJobsCount}
          icon={Briefcase}
          loading={jobsLoading}
        />
        <KpiCard
          label="Candidatures en attente"
          value={pendingAppsCount}
          icon={Users}
          loading={appsLoading}
        />
        <KpiCard
          label="Solde portefeuille"
          value={`${walletBalance.toLocaleString("fr-FR")} FCFA`}
          icon={Wallet}
          loading={profileLoading}
        />
        <KpiCard
          label="Factures"
          value={invoiceCount}
          icon={FileText}
          loading={invoicesLoading}
        />
      </div>

      {/* Charts. Ordered by the question each answers: am I getting staff, what
          shape is my portfolio in, what is this costing me. */}
      {jobsLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      ) : (
        <div className="space-y-3">
          <FillRateMeter rate={rate} />
          <OfferStageBar counts={stageCounts} />
        </div>
      )}

      {invoicesLoading ? (
        <Skeleton className="h-40 rounded-xl" />
      ) : (
        <SpendChart points={spend} />
      )}

      {/* Recent invoices */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Factures récentes</h2>
        </div>

        {invoicesLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        ) : !invoices?.length ? (
          <EmptyState icon={FileText} message="Aucune facture pour le moment." />
        ) : (
          <div className="bg-card shadow-soft rounded-xl divide-y divide-border">
            {invoices.slice(0, 5).map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {inv.reason === "CONTACT_UNLOCK"
                      ? "Déverrouillage contact"
                      : inv.reason === "PENALTY"
                        ? "Pénalité"
                        : "Autre"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(inv.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {Number(inv.amount).toLocaleString("fr-FR")} FCFA
                  </span>
                  {/* Every invoice is a receipt of a completed payment, so the
                      indicator is uniform ("Payée"). Invoice.status only tracks
                      whether the PDF was downloaded, not payment. */}
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600 shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                    Payée
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={() => navigate("/profile")}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-card shadow-soft py-3 text-sm font-medium text-foreground active:bg-muted/60"
      >
        <ArrowLeft className="size-4" />
        Retour au profil
      </button>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  message,
}: {
  icon: React.ElementType;
  message: string;
}) {
  return (
    <div className="bg-card shadow-soft rounded-xl px-4 py-8 flex flex-col items-center gap-2 text-center">
      <Icon className="h-8 w-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
