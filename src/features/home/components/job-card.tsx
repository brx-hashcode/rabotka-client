import { useNavigate } from "react-router";
import {
  Bookmark,
  Calendar,
  Coins,
  MapPin,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PAYMENT_FLOW_LABELS } from "@/features/employer";
import { useApplyToJob, useToggleSaveJob } from "@/hooks/use-jobs";
import type { JobFeedItem } from "@/lib/api/job-feed-controller";
import { cn, formatAmount, formatDateTime } from "@/lib/utils";

type Props = {
  readonly job: JobFeedItem;
  /** False when the worker has hit the daily application limit. */
  readonly canApply: boolean;
};

export function JobCard({ job, canApply }: Props) {
  const navigate = useNavigate();
  const apply = useApplyToJob();
  const toggleSave = useToggleSaveJob();

  const flowLabel = PAYMENT_FLOW_LABELS[job.paymentFlow] ?? "";
  const goDetail = () => navigate(`/offres/${job.id}`);

  let applyLabel = "Postuler";
  if (job.applied) applyLabel = "Déjà postulé";
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
          {job.amount != null && (
            <p className="flex items-center gap-2">
              <Coins className="h-4 w-4 shrink-0 text-whatsapp" />
              <span className="font-medium text-foreground">
                {formatAmount(job.amount)}
              </span>
              {flowLabel && <span>{flowLabel}</span>}
            </p>
          )}
          <p className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            {formatDateTime(job.scheduledAt)}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{job.address}</span>
          </p>
        </div>
      </button>

      <Button
        className="mt-4 w-full bg-whatsapp text-white hover:bg-whatsapp active:bg-whatsapp-dark"
        disabled={job.applied || !canApply || apply.isPending}
        onClick={() => apply.mutate(job.id)}
      >
        {apply.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {applyLabel}
      </Button>
    </div>
  );
}
