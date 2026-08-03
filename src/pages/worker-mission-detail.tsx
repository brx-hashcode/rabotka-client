import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Calendar, Coins, MapPin, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryErrorState } from "@/components/common/query-error-state";
import { CompleteMissionDrawer } from "@/components/common/complete-mission-drawer";
import { PdfDownloadLink } from "@/components/common/pdf-download-link";
import { useWorkerMission } from "@/hooks/use-worker-mission";
import { useCompleteWorkerMission } from "@/hooks/use-complete-worker-mission";
import {
  useCancelWorkerMission,
  useCancellationPreview,
} from "@/hooks/use-cancel-worker-mission";
import { CancelApplicationDrawer } from "@/features/jobs/components/cancel-application-drawer";
import {
  ScreenHeader,
  StatusChip,
  APPLICATION_STATUS_LABELS,
  getApplicationStatusChipClass,
} from "@/features/employer";
import { contractDownloadUrl } from "@/lib/api/profile-controller";
import { cn, formatAmount, formatDateTime } from "@/lib/utils";

const COMPLETABLE_STATUSES = new Set(["ACCEPTED", "STARTED", "END"]);

/**
 * States a worker may still withdraw from. Mirrors ApplicationService.cancel()'s
 * own guard — the backend re-checks authoritatively; this only decides whether
 * to offer the action.
 */
const CANCELLABLE_STATUSES = new Set([
  "PENDING",
  "VIEWED",
  "WAITING_PAYMENT",
  "ACCEPTED",
]);

export default function WorkerMissionDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    data: mission,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useWorkerMission(id);
  const complete = useCompleteWorkerMission();
  const [rateOpen, setRateOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const { mutate: cancelMission, isPending: isCancelling } =
    useCancelWorkerMission();
  // Only fetched while the dialog is open — no extra request on page load.
  const { data: cancelPreview, isLoading: isPreviewLoading } =
    useCancellationPreview(id, cancelOpen);

  const goBack = () => navigate(-1);

  // Once hired the item is a "mission"; otherwise it's still a "candidature".
  const engaged = mission
    ? COMPLETABLE_STATUSES.has(mission.applicationStatus)
    : true;
  const title = engaged ? "Détail de la mission" : "Détail de la candidature";

  const canRate =
    !!mission &&
    !mission.ratedEmployer &&
    COMPLETABLE_STATUSES.has(mission.applicationStatus);

  const cancellable =
    !!mission && CANCELLABLE_STATUSES.has(mission.applicationStatus);

  // The worker owes their half of the contact unlock. Without this the screen
  // showed "Paiement requis" with no way to act on it.
  const awaitingPayment =
    !!mission && mission.applicationStatus === "WAITING_PAYMENT";

  const handleCancel = (reason?: string) => {
    if (!id) return;
    cancelMission(
      { id, reason },
      {
        onSuccess: () => {
          setCancelOpen(false);
          goBack();
        },
      },
    );
  };

  const handleRate = (score: number) => {
    if (!id) return;
    complete.mutate({ id, score }, { onSuccess: () => setRateOpen(false) });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ScreenHeader title={title} onBack={goBack} />

      {isLoading && (
        <div className="space-y-4 px-4 py-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      )}

      {!isLoading && (isError || !mission) && (
        <QueryErrorState
          className="flex-1"
          message="Impossible de charger cette mission."
          onRetry={refetch}
          isRetrying={isFetching}
        />
      )}

      {!isLoading && mission && (
        <div className="space-y-4 px-4 py-4">
          {/* Title + status */}
          <div className="rounded-xl bg-card p-4 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <h2 className="min-w-0 flex-1 text-lg font-bold leading-snug text-foreground">
                {mission.jobOffer.title}
              </h2>
              <StatusChip
                className={cn(
                  "shrink-0",
                  getApplicationStatusChipClass(mission.applicationStatus),
                )}
              >
                {APPLICATION_STATUS_LABELS[mission.applicationStatus] ??
                  mission.applicationStatus}
              </StatusChip>
            </div>
          </div>

          {/* Key info */}
          <Section title="Informations">
            {mission.jobOffer.amount != null && (
              <InfoRow
                icon={<Coins className="h-4 w-4 text-whatsapp" />}
                label="Rémunération"
              >
                <span className="font-medium text-foreground">
                  {formatAmount(mission.jobOffer.amount)}
                </span>
              </InfoRow>
            )}
            <InfoRow
              icon={<Calendar className="h-4 w-4 text-whatsapp" />}
              label="Date prévue"
            >
              {formatDateTime(mission.jobOffer.scheduledAt)}
            </InfoRow>
            <InfoRow
              icon={<MapPin className="h-4 w-4 text-whatsapp" />}
              label="Adresse"
            >
              {mission.jobOffer.address}
            </InfoRow>
          </Section>

          {/* Description */}
          {mission.jobOffer.description && (
            <Section title="Description">
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                {mission.jobOffer.description}
              </p>
            </Section>
          )}

          {/* Employer */}
          <Section title="Recruteur">
            <p className="text-sm font-medium text-foreground">
              {mission.employer.firstName} {mission.employer.lastName}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {mission.employer.ratingAvg != null && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {mission.employer.ratingAvg.toFixed(1)}
                  {mission.employer.ratingCount > 0 &&
                    ` (${mission.employer.ratingCount})`}
                </span>
              )}
              {mission.employer.reliabilityScore != null && (
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-whatsapp" />
                  Fiabilité {mission.employer.reliabilityScore}%
                </span>
              )}
            </div>
          </Section>

          {/* Contract */}
          {mission.contractId && (
            <PdfDownloadLink
              href={contractDownloadUrl(mission.contractId)}
              title="Contrat de la mission"
            />
          )}

          {/* Action / rated state */}
          {canRate && (
            <Button
              className="w-full bg-whatsapp text-white hover:bg-whatsapp active:bg-whatsapp-dark"
              onClick={() => setRateOpen(true)}
            >
              Terminer & noter le recruteur
            </Button>
          )}

          {mission.ratedEmployer && (
            <div className="flex items-center justify-center rounded-xl bg-whatsapp/10 p-4 text-sm font-medium text-whatsapp">
              Vous avez noté le recruteur
            </div>
          )}

          {/* Pay my share of the contact unlock */}
          {awaitingPayment && (
            <Button
              className="w-full bg-whatsapp text-white hover:bg-whatsapp active:bg-whatsapp-dark"
              onClick={() => navigate(`/applications/${id}/paiement`)}
            >
              Payer ma part et recevoir le contact
            </Button>
          )}

          {/* Withdraw — previously only possible over WhatsApp */}
          {cancellable && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setCancelOpen(true)}
            >
              Annuler ma candidature
            </Button>
          )}
        </div>
      )}

      <CancelApplicationDrawer
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        offerTitle={mission?.jobOffer.title ?? ""}
        preview={cancelPreview}
        isPreviewLoading={isPreviewLoading}
        isPending={isCancelling}
        onConfirm={handleCancel}
      />

      <CompleteMissionDrawer
        open={rateOpen}
        onOpenChange={setRateOpen}
        title="Noter le recruteur"
        subtitle={
          mission
            ? `Votre expérience avec ${mission.employer.firstName} ${mission.employer.lastName}`
            : undefined
        }
        submitLabel="Envoyer ma note"
        onSubmit={handleRate}
        isPending={complete.isPending}
      />
    </div>
  );
}

const Section = ({
  title,
  children,
}: Readonly<{ title: string; children: React.ReactNode }>) => (
  <section className="rounded-xl bg-card p-4 shadow-soft">
    <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {title}
    </p>
    {children}
  </section>
);

const InfoRow = ({
  icon,
  label,
  children,
}: Readonly<{
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}>) => (
  <div className="flex items-start gap-3 py-1.5">
    <div className="mt-0.5 shrink-0">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{children}</p>
    </div>
  </div>
);
