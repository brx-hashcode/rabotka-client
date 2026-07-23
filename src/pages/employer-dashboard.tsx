import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useProfileMe } from "@/hooks/use-profile-me";
import { useEmployerJobOffers } from "@/hooks/use-employer-job-offers";
import { useEmployerApplications } from "@/hooks/use-employer-applications";
import { useProfileInvoices } from "@/hooks/use-profile-invoices";
import { useNavigate } from "react-router";
import {
  Briefcase,
  Users,
  Wallet,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { EmployerJobOfferItem } from "@/lib/api/job-offer-controller";

const JOB_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  PARTIALLY_FILLED: "Partiellement pourvu",
  FILLED: "Pourvu",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  EXPIRED: "Expiré",
  CANCELLED: "Annulé",
  DRAFT: "Brouillon",
};

const APPLICATION_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  VIEWED: "Vue",
  WAITING_PAYMENT: "Paiement requis",
  ACCEPTED: "Accepté",
  STARTED: "En cours",
  END: "Terminé",
  REJECTED: "Rejeté",
  CANCELLED: "Annulé",
};

function getJobStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (["ACTIVE", "PARTIALLY_FILLED"].includes(status)) return "default";
  if (["FILLED", "IN_PROGRESS"].includes(status)) return "secondary";
  if (["EXPIRED", "CANCELLED"].includes(status)) return "destructive";
  return "outline";
}

function getApplicationStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "ACCEPTED" || status === "STARTED") return "default";
  if (status === "PENDING" || status === "VIEWED") return "secondary";
  if (status === "REJECTED" || status === "CANCELLED") return "destructive";
  return "outline";
}

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
    <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
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

function JobOfferRow({ offer }: { offer: EmployerJobOfferItem }) {
  const filled = offer.acceptedCount;
  const total = offer.quantity;
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground truncate">
          {offer.title}
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
          <Clock className="h-3 w-3" />
          {formatDate(offer.scheduledAt)} , {offer.address}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden max-w-[80px]">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {filled}/{total} postes
          </span>
        </div>
      </div>
      <Badge variant={getJobStatusVariant(offer.status)} className="ml-3 shrink-0 text-xs">
        {JOB_STATUS_LABELS[offer.status] ?? offer.status}
      </Badge>
    </div>
  );
}

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfileMe();
  const { data: jobOffers, isLoading: jobsLoading } = useEmployerJobOffers(5);
  const { data: applications, isLoading: appsLoading } =
    useEmployerApplications(1, 5);
  const { data: invoices, isLoading: invoicesLoading } = useProfileInvoices();

  if (!profileLoading && profile?.profileType !== "EMPLOYER") {
    navigate("/profile");
    return null;
  }

  const activeJobsCount =
    jobOffers?.data.filter((j) =>
      ["ACTIVE", "PARTIALLY_FILLED", "FILLED", "IN_PROGRESS"].includes(
        j.status,
      ),
    ).length ?? 0;

  const pendingAppsCount =
    applications?.data.filter((a) =>
      ["PENDING", "VIEWED"].includes(a.status),
    ).length ?? 0;

  const walletBalance = profile?.walletBalance ?? 0;
  const invoiceCount = invoices?.length ?? 0;

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

      {/* Active job offers */}
      <section>
        <div className="mb-3">
          <h2 className="font-semibold text-foreground">Mes offres d'emploi</h2>
        </div>

        {jobsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : !jobOffers?.data.length ? (
          <EmptyState
            icon={Briefcase}
            message="Aucune offre publiée pour le moment."
          />
        ) : (
          <div className="bg-card border border-border rounded-xl px-4">
            {jobOffers.data.map((offer) => (
              <JobOfferRow key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </section>

      {/* Recent applications */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">
            Candidatures récentes
          </h2>
        </div>

        {appsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : !applications?.data.length ? (
          <EmptyState
            icon={Users}
            message="Aucune candidature reçue pour le moment."
          />
        ) : (
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {applications.data.map((app) => (
              <div
                key={app.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {(app.worker.firstName?.[0] ?? "?").toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {app.worker.firstName} {app.worker.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {app.jobOffer.title}
                  </p>
                </div>
                <Badge
                  variant={getApplicationStatusVariant(app.status)}
                  className="shrink-0 text-xs"
                >
                  {APPLICATION_STATUS_LABELS[app.status] ?? app.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </section>

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
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
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
                  {inv.status === "DOWNLOADED" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={() => navigate("/profile")}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium text-foreground hover:bg-muted"
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
    <div className="bg-card border border-border rounded-xl px-4 py-8 flex flex-col items-center gap-2 text-center">
      <Icon className="h-8 w-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
