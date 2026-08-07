import { useState } from "react";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/employment-type";
import {
  jobLocationLabel,
  jobLocationRegion,
  REMOTE_LOCATION_LABEL,
} from "@/lib/job-location";
import { useNavigate, useParams } from "react-router";
import {
  Calendar,
  Coins,
  MapPin,
  FileText,
  Globe,
  Building2,
  ShieldCheck,
  Bookmark,
  Loader2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryErrorState } from "@/components/common/query-error-state";
import {
  ScreenHeader,
  PAYMENT_FLOW_LABELS,
  isClosedToApplications,
} from "@/features/employer";
import {
  useJobDetail,
  useApplyToJob,
  useToggleSaveJob,
  useCanApply,
} from "@/hooks/use-jobs";
import { ApplyConfirmDrawer } from "@/features/jobs/components/apply-confirm-drawer";
import { useKycGate } from "@/hooks/use-kyc-gate";
import { KycNotice, kycShortLabel } from "@/features/kyc";
import { cn, formatAmount, formatDateTime } from "@/lib/utils";

export default function JobDetailWorker() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    data: job,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useJobDetail(id);
  // Null for a remote job, and for offers created before the location pickers
  // existed — the row is dropped rather than rendered empty.
  const region = job ? jobLocationRegion(job) : null;
  const { canApply, quota } = useCanApply();
  const { blocked, reason } = useKycGate();
  const apply = useApplyToJob();
  const toggleSave = useToggleSaveJob();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const dailyExhausted = quota != null && quota.remaining <= 0;

  // About the offer, not the worker — so it is checked first. Applying to a
  // filled offer costs the worker one of only three concurrent slots and can
  // never succeed.
  const offerClosed = job ? isClosedToApplications(job) : false;

  let applyLabel = "Postuler";
  if (job?.applied) applyLabel = "Déjà postulé";
  else if (offerClosed) applyLabel = "Offre pourvue";
  else if (blocked && reason) applyLabel = kycShortLabel(reason);
  else if (dailyExhausted) applyLabel = "Limite quotidienne atteinte";
  else if (!canApply) applyLabel = "Trop de candidatures en cours";

  return (
    <div className="flex min-h-screen flex-col">
      <ScreenHeader
        title="Détail de l'offre"
        onBack={() => navigate(-1)}
        action={
          job ? (
            <button
              type="button"
              aria-label={job.saved ? "Retirer des favoris" : "Enregistrer"}
              onClick={() =>
                toggleSave.mutate({ jobOfferId: job.id, saved: job.saved })
              }
              className="flex h-9 w-9 items-center justify-center rounded-md text-foreground active:bg-secondary"
            >
              <Bookmark
                className={cn(
                  "h-5 w-5",
                  job.saved && "fill-whatsapp text-whatsapp",
                )}
              />
            </button>
          ) : undefined
        }
      />

      {isLoading && (
        <div className="space-y-4 px-4 py-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      )}

      {!isLoading && (isError || !job) && (
        <QueryErrorState
          className="flex-1"
          message="Impossible de charger cette offre."
          onRetry={refetch}
          isRetrying={isFetching}
        />
      )}

      {!isLoading && job && (
        <div className="space-y-4 px-4 py-4">
          <div className="rounded-xl bg-card p-4 shadow-soft">
            <h2 className="text-lg font-bold leading-snug text-foreground">
              {job.title}
            </h2>
          </div>

          <Section title="Informations">
            {job.amount != null && (
              <InfoRow
                icon={<Coins className="h-4 w-4 text-whatsapp" />}
                label="Rémunération"
              >
                <span className="font-medium text-foreground">
                  {formatAmount(job.amount)}
                </span>{" "}
                {PAYMENT_FLOW_LABELS[job.paymentFlow] ?? ""}
              </InfoRow>
            )}
            <InfoRow
              icon={<FileText className="h-4 w-4 text-whatsapp" />}
              label="Type de contrat"
            >
              {EMPLOYMENT_TYPE_LABELS[job.employmentType] ?? job.employmentType}
            </InfoRow>
            {/* A CDI/CDD/STAGE has no closing date. Dropping the row entirely
                rather than printing a dash: a labelled blank reads as data that
                failed to load. */}
            {job.scheduledAt && (
              <InfoRow
                icon={<Calendar className="h-4 w-4 text-whatsapp" />}
                label="Date de clôture"
              >
                {formatDateTime(job.scheduledAt)}
              </InfoRow>
            )}
            {/* Where the job is, split across rows now that the payload carries
                more than a street. A remote job has no address at all, so
                printing an empty "Adresse" was the old failure; and an address
                alone hid which city a worker would be travelling to. */}
            {job.isRemote ? (
              <InfoRow
                icon={<Globe className="h-4 w-4 text-whatsapp" />}
                label="Lieu"
              >
                <span className="font-medium text-foreground">
                  {REMOTE_LOCATION_LABEL}
                </span>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Mission à distance — aucun déplacement.
                </p>
              </InfoRow>
            ) : (
              <>
                <InfoRow
                  icon={<MapPin className="h-4 w-4 text-whatsapp" />}
                  label="Adresse"
                >
                  {jobLocationLabel(job)}
                </InfoRow>
                {region && (
                  <InfoRow
                    icon={<Building2 className="h-4 w-4 text-whatsapp" />}
                    label="Ville"
                  >
                    {region}
                  </InfoRow>
                )}
              </>
            )}
          </Section>

          {job.description && (
            <Section title="Description">
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                {job.description}
              </p>
            </Section>
          )}

          {/* Employer */}
          {job.employer && (
            <Section title="Recruteur">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  {job.employer.avatarUrl && (
                    <AvatarImage
                      src={job.employer.avatarUrl}
                      alt={`${job.employer.firstName} ${job.employer.lastName}`}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="bg-muted text-sm font-semibold text-muted-foreground">
                    {`${job.employer.firstName?.[0] ?? ""}${
                      job.employer.lastName?.[0] ?? ""
                    }`.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {job.employer.firstName} {job.employer.lastName}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {job.employer.ratingAvg != null && (
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {job.employer.ratingAvg.toFixed(1)}
                        {job.employer.ratingCount > 0 &&
                          ` (${job.employer.ratingCount})`}
                      </span>
                    )}
                    {job.employer.reliabilityScore != null && (
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="h-4 w-4 text-whatsapp" />
                        Fiabilité {job.employer.reliabilityScore}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Section>
          )}

          {blocked && reason && <KycNotice reason={reason} className="mb-3" />}

          <Button
            className="w-full bg-whatsapp text-white hover:bg-whatsapp active:bg-whatsapp-dark"
            disabled={
              job.applied ||
              offerClosed ||
              !canApply ||
              blocked ||
              apply.isPending
            }
            onClick={() => setConfirmOpen(true)}
          >
            {apply.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {applyLabel}
          </Button>

          <ApplyConfirmDrawer
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title={job.title}
            scheduledAt={job.scheduledAt}
            address={jobLocationLabel(job)}
            amount={job.amount}
            isPending={apply.isPending}
            onConfirm={() =>
              apply.mutate(job.id, { onSuccess: () => setConfirmOpen(false) })
            }
          />
        </div>
      )}
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
