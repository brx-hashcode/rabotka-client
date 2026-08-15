import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  Briefcase,
  BadgeCheck,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScreenHeader, StatusChip } from "@/features/employer";
import { useRecommendedWorker } from "@/hooks/use-recommendations";
import { useKycGate } from "@/hooks/use-kyc-gate";
import { KycNotice, kycShortLabel } from "@/features/kyc";
import { useAccountGate } from "@/hooks/use-account-gate";
import { AccountNotice, accountShortLabel } from "@/features/account";
import { ContactConfirmDrawer } from "@/features/employer/components/contact-confirm-drawer";

export default function RecommendedWorkerDetail() {
  const navigate = useNavigate();
  const { workerId = "" } = useParams<{ workerId: string }>();
  const { data, isLoading, isError } = useRecommendedWorker(workerId);
  const { blocked, reason } = useKycGate();
  // Account before KYC, matching job-card on the worker side: a suspension is
  // the more severe problem, so it wins both the notice and the label.
  const { blocked: accountBlocked, reason: accountReason } = useAccountGate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  let contactLabel = "Contacter";
  if (accountBlocked && accountReason)
    contactLabel = accountShortLabel(accountReason);
  else if (blocked && reason) contactLabel = kycShortLabel(reason);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [workerId]);

  const worker = data?.worker;
  const aiScore = Math.round((worker?.score ?? 0) * 100);
  // `categoryNames` is absent on an older backend; fall back to the single
  // category rather than showing nothing.
  const domains =
    worker?.categoryNames?.length
      ? worker.categoryNames
      : [worker?.categoryName].filter((n): n is string => Boolean(n));
  const initials = worker
    ? `${worker.firstName?.[0] ?? ""}${worker.lastName?.[0] ?? ""}`.toUpperCase()
    : "";

  return (
    <div className="flex min-h-screen flex-col">
      <ScreenHeader title="Profil" onBack={() => navigate(-1)} />

      {isLoading && (
        <div className="space-y-4 px-4 py-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      )}

      {!isLoading && (isError || !worker) && (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
          <p className="text-sm text-muted-foreground">
            Impossible de charger ce profil.
          </p>
        </div>
      )}

      {!isLoading && worker && (
        <div className="space-y-3 px-4 py-4">
          {/*
            Identity and the headline numbers share one card. Split across two,
            a worker with no AI score and no ratings left "En bref" holding two
            items beside an empty band under their name — two sparse cards where
            one dense one reads better.
          */}
          <div className="rounded-xl bg-card p-4 shadow-soft">
            <div className="flex gap-3">
              <Avatar className="h-16 w-16 shrink-0">
                {worker.avatarUrl && (
                  <AvatarImage
                    src={worker.avatarUrl}
                    alt={`${worker.firstName} ${worker.lastName}`}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="bg-muted text-lg font-semibold text-muted-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-bold text-foreground">
                  {worker.firstName} {worker.lastName}
                </p>

                {/* Shown only when verified. A worker whose KYC is pending or
                    rejected simply has no badge — the absence says nothing, so
                    a review outcome is never published to employers. */}
                {worker.isVerified && (
                  <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-whatsapp">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Identité vérifiée
                  </span>
                )}

                {worker.address && (
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{worker.address}</span>
                  </p>
                )}

                {/* Wraps rather than a fixed grid: how many of these exist
                    varies per worker, and a grid left holes where a missing
                    rating or AI score used to be. */}
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {worker.reliabilityScore !== null && (
                    <Stat
                      icon={<ShieldCheck className="h-3.5 w-3.5 text-whatsapp" />}
                      value={`${worker.reliabilityScore}%`}
                      label="fiabilité"
                    />
                  )}
                  {/* The card that led here shows Score IA, so dropping it on
                      the detail reads as a loading failure. */}
                  {aiScore > 0 && (
                    <Stat
                      icon={<Sparkles className="h-3.5 w-3.5 text-whatsapp" />}
                      value={`${aiScore}%`}
                      label="score IA"
                    />
                  )}
                  <Stat
                    icon={<CheckCircle2 className="h-3.5 w-3.5 text-whatsapp" />}
                    value={String(worker.completedMissions)}
                    label={`mission${worker.completedMissions > 1 ? "s" : ""}`}
                  />
                  {worker.ratingAvg !== null && worker.ratingCount > 0 && (
                    <Stat
                      icon={
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      }
                      value={worker.ratingAvg.toFixed(1)}
                      label={`(${worker.ratingCount})`}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Domains — every one, not just the first. */}
          {domains.length > 0 && (
            <div className="rounded-xl bg-card p-4 shadow-soft">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Domaines
              </p>
              <div className="flex flex-wrap gap-2">
                {domains.map((name) => (
                  <StatusChip key={name} className="bg-whatsapp/10 text-whatsapp">
                    {name}
                  </StatusChip>
                ))}
              </div>
            </div>
          )}

          {worker.description && (
            <div className="rounded-xl bg-card p-4 shadow-soft">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                À propos
              </p>
              <p className="text-sm leading-relaxed text-foreground">
                {worker.description}
              </p>
            </div>
          )}

          {accountBlocked && accountReason && (
            <AccountNotice reason={accountReason} />
          )}
          {!accountBlocked && blocked && reason && (
            <KycNotice reason={reason} />
          )}

          <Button
            className="w-full bg-whatsapp text-white hover:bg-whatsapp-dark"
            disabled={blocked || accountBlocked}
            onClick={() => setConfirmOpen(true)}
          >
            {contactLabel}
          </Button>

          {worker.portfolioSlug && (
            <Button
              className="w-full bg-whatsapp/10 text-whatsapp shadow-none hover:bg-whatsapp/20"
              onClick={() => navigate(`/p/${worker.portfolioSlug}?back=1`)}
            >
              <Briefcase className="mr-2 h-4 w-4" />
              Voir le portfolio
            </Button>
          )}

          <ContactConfirmDrawer
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            workerId={worker.id}
            workerName={`${worker.firstName} ${worker.lastName}`.trim()}
            onConfirm={() => navigate(`/recommandations/${worker.id}/contact`)}
          />

        </div>
      )}
    </div>
  );
}

const Stat = ({
  icon,
  value,
  label,
}: Readonly<{ icon: React.ReactNode; value: string; label: string }>) => (
  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
    {icon}
    <span className="font-semibold text-foreground">{value}</span>
    {label}
  </span>
);
