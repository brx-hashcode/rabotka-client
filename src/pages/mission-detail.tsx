import { useState } from "react";
import { jobLocationDetail } from "@/lib/job-location";
import { EMPLOYMENT_TYPE_LABELS, isCompletable } from "@/lib/employment-type";
import { useNavigate, useParams } from "react-router";
import {
  Calendar,
  MapPin,
  Coins,
  Users,
  Hash,
  StickyNote,
  RefreshCw,
  Trash2,
  Star,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryErrorState } from "@/components/common/query-error-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/features/portfolio/components/confirm-dialog";
import { CompleteMissionDrawer } from "@/components/common/complete-mission-drawer";
import { PdfDownloadLink } from "@/components/common/pdf-download-link";
import { contractDownloadUrl } from "@/lib/api/profile-controller";
import { useJobOffer } from "@/hooks/use-job-offer";
import { useJobOfferApplications } from "@/hooks/use-job-offer-applications";
import { useRepublishJobOffer } from "@/hooks/use-republish-job-offer";
import { RepublishOfferDialog } from "@/features/employer/components/republish-offer-dialog";
import { useDeleteJobOffer } from "@/hooks/use-delete-job-offer";
import { useRateWorker } from "@/hooks/use-rate-worker";
import { useKycGate } from "@/hooks/use-kyc-gate";
import { KycNotice } from "@/features/kyc";
import {
  ScreenHeader,
  StatusChip,
  JOB_STATUS_LABELS,
  JOB_STATUS_CHIP_CLASSES,
  PAYMENT_FLOW_LABELS,
  APPLICATION_STATUS_LABELS,
  getApplicationStatusChipClass,
} from "@/features/employer";
import type { JobOfferWorkerItem } from "@/lib/api/job-offer-controller";
import { cn, formatDateTime, formatOfferAmount } from "@/lib/utils";

export default function MissionDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    data: offer,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useJobOffer(id);
  const { data: workers, isLoading: workersLoading } =
    useJobOfferApplications(id);
  const { mutate: deleteOffer, isPending: isDeleting } = useDeleteJobOffer();
  const { mutate: republishOffer, isPending: isRepublishing } =
    useRepublishJobOffer();
  const rate = useRateWorker();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [republishOpen, setRepublishOpen] = useState(false);
  const [rateTarget, setRateTarget] = useState<JobOfferWorkerItem | null>(
    null,
  );

  const goBack = () => navigate(-1);

  // An offer can be removed only while it carries no engagement: still open
  // (ACTIVE) or dead (EXPIRED), with no hired workers and no candidates. The
  // backend re-verifies authoritatively.
  const deletable =
    !!offer &&
    (offer.status === "ACTIVE" || offer.status === "EXPIRED") &&
    offer.acceptedCount === 0 &&
    !workersLoading &&
    (workers?.length ?? 0) === 0;

  // The employer rates; they no longer close anything. Only a worker who has
  // confirmed their own mission (application → END) can be rated, which is the
  // same rule the API enforces — showing the button earlier would just produce
  // a 400 saying the worker has not confirmed yet.
  const ratableWorkers =
    workers?.filter((w) => w.status === "END" && !w.ratedByEmployer) ?? [];
  // A CDI/CDD/STAGE never completes, so no worker on one can reach END and
  // there is nothing to rate. Gated explicitly rather than relying on that,
  // so the button cannot reappear if the status rules change.
  const ratable =
    !!offer && isCompletable(offer.employmentType) && ratableWorkers.length > 0;
  // Everyone rateable already has been — say so, rather than just showing an
  // empty space where the button used to be.
  const allRated =
    !!offer &&
    !ratable &&
    (workers?.some((w) => w.status === "END" && w.ratedByEmployer) ?? false);

  // Only an expired offer can be reopened. The backend re-checks.
  // Republishing puts a live offer back on the market, so it needs the same KYC
  // gate as creating one — otherwise it is a way around /job-offers/new.
  const { blocked: kycBlocked, reason: kycReason } = useKycGate();
  const republishable = !!offer && offer.status === "EXPIRED";

  const handleDelete = () => {
    if (!id) return;
    deleteOffer(id, {
      onSuccess: () => {
        setConfirmOpen(false);
        goBack();
      },
    });
  };

  const handleRepublish = (scheduledAt: string) => {
    if (!id) return;
    republishOffer(
      { id, scheduledAt },
      { onSuccess: () => setRepublishOpen(false) },
    );
  };

  const handleRate = (score: number, note?: string) => {
    if (!id || !rateTarget) return;
    rate.mutate(
      { applicationId: rateTarget.applicationId, offerId: id, score, note },
      { onSuccess: () => setRateTarget(null) },
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ScreenHeader title="Détail de l'offre" onBack={goBack} />

      {isLoading && <DetailSkeleton />}

      {!isLoading && (isError || !offer) && (
        <QueryErrorState
          className="flex-1"
          message="Impossible de charger cette mission."
          onRetry={refetch}
          isRetrying={isFetching}
        />
      )}

      {!isLoading && offer && (
        <div className="space-y-4 px-4 py-4">
          {/* Title + status */}
          <div className="rounded-xl shadow-soft bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="min-w-0 flex-1 text-lg font-bold leading-snug text-foreground">
                {offer.title}
              </h2>
              <StatusChip
                className={cn("shrink-0", JOB_STATUS_CHIP_CLASSES[offer.status])}
              >
                {JOB_STATUS_LABELS[offer.status] ?? offer.status}
              </StatusChip>
            </div>

            {offer.status !== "COMPLETED" && (
              <div className="mt-3 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-whatsapp transition-all"
                    style={{
                      width: `${
                        offer.quantity > 0
                          ? Math.round(
                              (offer.acceptedCount / offer.quantity) * 100,
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {offer.acceptedCount}/{offer.quantity} postes
                </span>
              </div>
            )}
          </div>

          {/* Rate the worker. The offer closes on its own once every hired
              worker has confirmed — that is the worker's call, not this one. */}
          {ratable && (
            <Button
              className="w-full bg-whatsapp text-white hover:bg-whatsapp-dark"
              onClick={() => setRateTarget(ratableWorkers[0])}
            >
              Noter le travailleur
            </Button>
          )}

          {allRated && (
            <div className="bg-card flex items-center justify-center gap-2 rounded-xl px-4 py-3 shadow-soft">
              <Star className="h-4 w-4 fill-whatsapp text-whatsapp" />
              <span className="text-sm font-medium text-foreground">
                Travailleur noté
              </span>
            </div>
          )}

          {/* Key info */}
          <Section title="Informations">
            <InfoRow icon={<Coins className="h-4 w-4 text-whatsapp" />} label="Rémunération">
              <span className="font-medium text-foreground">
                {formatOfferAmount(offer.amount)}
              </span>{" "}
              {PAYMENT_FLOW_LABELS[offer.paymentFlow] ?? ""}
            </InfoRow>
            <InfoRow
              icon={<FileText className="h-4 w-4 text-whatsapp" />}
              label="Type de contrat"
            >
              {EMPLOYMENT_TYPE_LABELS[offer.employmentType] ??
                offer.employmentType}
            </InfoRow>
            {offer.scheduledAt && (
              <InfoRow
                icon={<Calendar className="h-4 w-4 text-whatsapp" />}
                label="Date de clôture"
              >
                {formatDateTime(offer.scheduledAt)}
              </InfoRow>
            )}
            <InfoRow
              icon={<MapPin className="h-4 w-4 text-whatsapp" />}
              label="Adresse"
            >
              {jobLocationDetail(offer)}
            </InfoRow>
            <InfoRow
              icon={<Hash className="h-4 w-4 text-whatsapp" />}
              label="Référence"
            >
              {offer.reference}
            </InfoRow>
          </Section>

          {/* Description */}
          {offer.description && (
            <Section title="Description">
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                {offer.description}
              </p>
            </Section>
          )}

          {/* Note */}
          {offer.note && (
            <Section title="Note">
              <p className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                <StickyNote className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="whitespace-pre-line">{offer.note}</span>
              </p>
            </Section>
          )}

          {/* Workers on this mission */}
          {(workersLoading || (workers && workers.length > 0)) && (
            <Section
              title={`Travailleurs${workers ? ` (${workers.length})` : ""}`}
            >
              {workersLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-28 w-full rounded-xl" />
                  <Skeleton className="h-28 w-full rounded-xl" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                  {workers?.map((w) => (
                    <WorkerCard key={w.applicationId} item={w} />
                  ))}
                </div>
              )}
            </Section>
          )}

          {/* Contracts — one per hired worker that has one */}
          {workers?.some((w) => w.contractId) && (
            <div className="space-y-2">
              <p className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Contrats
              </p>
              {workers
                .filter((w) => w.contractId)
                .map((w) => (
                  <PdfDownloadLink
                    key={w.applicationId}
                    href={contractDownloadUrl(w.contractId as string)}
                    title={`Contrat — ${w.worker.firstName} ${w.worker.lastName}`}
                  />
                ))}
            </div>
          )}

          {/* Republish — the expiry notification's action, now on web too */}
          {republishable && kycBlocked && kycReason && (
            <KycNotice reason={kycReason} />
          )}
          {republishable && (
            <Button
              variant="outline"
              className="w-full"
              disabled={kycBlocked}
              onClick={() => setRepublishOpen(true)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Republier l'offre
            </Button>
          )}

          {/* Delete — only while the offer is still removable */}
          {deletable && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer l'offre
            </Button>
          )}
        </div>
      )}

      <RepublishOfferDialog
        open={republishOpen}
        onOpenChange={setRepublishOpen}
        offerTitle={offer?.title ?? ""}
        isPending={isRepublishing}
        onConfirm={handleRepublish}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Supprimer cette offre ?"
        description="Cette action est irréversible."
        actionLabel="Supprimer"
        onConfirm={handleDelete}
        isPending={isDeleting}
      />

      <CompleteMissionDrawer
        open={!!rateTarget}
        onOpenChange={(o) => !o && setRateTarget(null)}
        title="Noter le travailleur"
        subtitle={
          rateTarget
            ? `Notez ${rateTarget.worker.firstName} ${rateTarget.worker.lastName}`
            : undefined
        }
        showNote
        onSubmit={handleRate}
        isPending={rate.isPending}
      />
    </div>
  );
}

const Section = ({
  title,
  children,
}: Readonly<{ title: string; children: React.ReactNode }>) => (
  <section className="rounded-xl shadow-soft bg-card p-4">
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
      <p className={cn("text-sm text-foreground")}>{children}</p>
    </div>
  </div>
);

const WorkerCard = ({ item }: Readonly<{ item: JobOfferWorkerItem }>) => {
  const { worker } = item;
  const initials =
    `${worker.firstName?.[0] ?? ""}${worker.lastName?.[0] ?? ""}`.toUpperCase();
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <Avatar className="size-16">
        {worker.avatarUrl && (
          <AvatarImage
            src={worker.avatarUrl}
            alt={`${worker.firstName} ${worker.lastName}`}
            className="object-cover"
          />
        )}
        <AvatarFallback className="bg-muted text-sm font-semibold text-muted-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>

      <p className="w-full min-w-0 truncate text-sm font-semibold text-foreground">
        {worker.firstName} {worker.lastName}
      </p>

      {/* Contact is delivered on WhatsApp — never shown in-app. Show status. */}
      <StatusChip className={getApplicationStatusChipClass(item.status)}>
        {APPLICATION_STATUS_LABELS[item.status] ?? item.status}
      </StatusChip>
    </div>
  );
};

const DetailSkeleton = () => (
  <div className="space-y-4 px-4 py-4">
    <Skeleton className="h-28 w-full rounded-xl" />
    <Skeleton className="h-40 w-full rounded-xl" />
    <Skeleton className="h-24 w-full rounded-xl" />
  </div>
);
