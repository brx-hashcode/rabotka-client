import { useState } from "react";
import { jobLocationLabel } from "@/lib/job-location";
import { useNavigate } from "react-router";
import {
  Bookmark,
  Calendar,
  Coins,
  MapPin,
  Check,
  X,
  Ban,
  CircleCheck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PAYMENT_FLOW_LABELS,
  isClosedToApplications,
} from "@/features/employer";
import { ApplyConfirmDrawer } from "@/features/jobs/components/apply-confirm-drawer";
import { useKycGate } from "@/hooks/use-kyc-gate";
import { kycShortLabel } from "@/features/kyc";
import { useAccountGate } from "@/hooks/use-account-gate";
import { accountShortLabel } from "@/features/account";
import { useApplyToJob, useToggleSaveJob } from "@/hooks/use-jobs";
import type {
  ApplicationState,
  JobFeedItem,
} from "@/lib/api/job-feed-controller";
import { cn, formatDateTime, formatOfferAmount } from "@/lib/utils";
import { StartChatButton } from "@/features/discussions/components/start-chat-button";

/**
 * One label per situation, from the server's `applicationState`. NONE and
 * CAN_REAPPLY are absent on purpose: those are not statuses, they are "you may
 * apply", and get the apply button instead.
 */
const APPLICATION_STATUS: Partial<
  Record<
    ApplicationState,
    { label: string; icon: LucideIcon; tone: "positive" | "neutral" }
  >
> = {
  LIVE: { label: "Déjà postulé", icon: Check, tone: "positive" },
  REJECTED: { label: "Candidature refusée", icon: X, tone: "neutral" },
  ENDED: { label: "Mission terminée", icon: CircleCheck, tone: "neutral" },
  SELF_CANCELLED: { label: "Candidature annulée", icon: Ban, tone: "neutral" },
};

type Props = {
  readonly job: JobFeedItem;
  /** False when the worker has hit the daily application limit. */
  readonly canApply: boolean;
};

export function JobCard({ job, canApply }: Props) {
  const navigate = useNavigate();
  const apply = useApplyToJob();
  const toggleSave = useToggleSaveJob();
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Read here rather than threaded in as a prop: it is a free cache read, and a
  // second prop would mean touching every screen that renders a JobCard.
  // Deliberately separate from `canApply` — a daily quota and an unverified
  // identity are different problems with different remedies.
  const { blocked, reason } = useKycGate();
  // Separate again from the KYC gate: a suspended account is not an unverified
  // one, and it is the more severe of the two — so it wins the label below.
  const { blocked: accountBlocked, reason: accountReason } = useAccountGate();

  const flowLabel = PAYMENT_FLOW_LABELS[job.paymentFlow] ?? "";
  const hasAmount = job.amount != null && job.amount !== 0;
  const goDetail = () => navigate(`/offres/${job.id}`);

  // About the offer rather than the worker, so it takes precedence: a filled
  // offer can never accept the application, whatever the worker's quota says.
  const offerClosed = isClosedToApplications(job);

  /**
   * The application's situation, when there is one to report. Each of these
   * used to render as the same disabled "Déjà postulé" — including a cancelled
   * application the worker was allowed to re-apply to. Now each says what is
   * true, and all of them share ONE calm look: a status is information, and a
   * disabled gradient reads as a broken or loading button.
   */
  const status = APPLICATION_STATUS[job.applicationState];

  // Only consulted when there is no status above, i.e. the worker can apply.
  let applyLabel =
    job.applicationState === "CAN_REAPPLY" ? "Postuler à nouveau" : "Postuler";
  // "Offre pourvue" se lisait comme un statut de SA candidature. Ce libellé ne
  // s'affiche qu'à quelqu'un qui n'a pas de candidature en cours : il parle
  // donc du poste, pas de la personne, et doit le dire.
  if (offerClosed) applyLabel = "Plus de place disponible";
  else if (accountBlocked && accountReason)
    applyLabel = accountShortLabel(accountReason);
  else if (blocked && reason) applyLabel = kycShortLabel(reason);
  else if (!canApply) applyLabel = "Limite atteinte";

  return (
    <div className="relative rounded-xl bg-card p-4 shadow-soft">
      {/* Bookmark toggle (sibling of the nav button → no nested buttons) */}
      <button
        type="button"
        aria-label={job.saved ? "Retirer des favoris" : "Enregistrer"}
        onClick={() => toggleSave.mutate({ jobOfferId: job.id, saved: job.saved })}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-whatsapp/10 text-whatsapp active:bg-whatsapp/20"
      >
        <Bookmark
          className={cn("h-5 w-5", job.saved && "fill-whatsapp")}
        />
      </button>

      <button type="button" onClick={goDetail} className="block w-full text-left">
        <div className="flex items-start gap-3">
          {job.employer && (
            <Avatar className="h-11 w-11 shrink-0">
              {job.employer.avatarUrl && (
                <AvatarImage
                  src={job.employer.avatarUrl}
                  alt={`${job.employer.firstName} ${job.employer.lastName}`}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
                {`${job.employer.firstName?.[0] ?? ""}${
                  job.employer.lastName?.[0] ?? ""
                }`.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="pr-9 font-semibold leading-snug text-foreground">
              {job.title}
            </h3>
            {job.employer && (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {job.employer.firstName} {job.employer.lastName}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          {/* Always shown: an offer with no amount is «À négocier», which is
              information a worker needs, not an empty row to hide. */}
          <p className="flex items-center gap-2">
            <Coins className="h-4 w-4 shrink-0 text-whatsapp" />
            <span className="font-medium text-foreground">
              {formatOfferAmount(job.amount)}
            </span>
            {hasAmount && flowLabel && <span>{flowLabel}</span>}
          </p>
          {/* Guarded like the amount row above: an offer with no closing date
              would otherwise show a bare calendar icon beside a dash. */}
          {job.scheduledAt && (
            <p className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" />
              {formatDateTime(job.scheduledAt)}
            </p>
          )}
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{jobLocationLabel(job)}</span>
          </p>
        </div>
      </button>

      {/* Two intents, two controls — and the WEIGHT goes to whichever one is
          still live.

          Before applying, "Postuler" is the action and "Discuter" does not
          exist yet (no application, nothing to talk about).

          After applying, the apply button is dead: a disabled full-width
          gradient beside a small chat icon put the emphasis exactly backwards,
          on the one thing you could no longer do. So the roles swap — the
          application becomes a calm status with a tick, and "Discuter" takes
          the primary style. */}
      <div className="mt-4 flex items-center gap-2">
        {status ? (
          <>
            <div
              className={cn(
                "flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md text-sm font-semibold",
                status.tone === "positive"
                  ? "bg-whatsapp/10 text-whatsapp-dark"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <status.icon className="h-4 w-4" strokeWidth={2.25} />
              {status.label}
            </div>
            {/* Talking takes the primary style when it is the live action
                left. Only a LIVE application carries an id, so every other
                status simply has no button here. */}
            <StartChatButton
              target={{ kind: "application", id: job.applicationId }}
              emphasis="primary"
              className="flex-1"
            />
          </>
        ) : (
          <Button
            className="flex-1"
            disabled={offerClosed || !canApply || blocked || accountBlocked}
            loading={apply.isPending}
            onClick={() => setConfirmOpen(true)}
          >
            {applyLabel}
          </Button>
        )}
      </div>

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
  );
}
