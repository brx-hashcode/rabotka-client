import { EMPLOYMENT_TYPE_SHORT } from "@/lib/employment-type";
import { Calendar, MapPin, Users, Coins } from "lucide-react";
import { cn, formatAmount, formatDate } from "@/lib/utils";
import type { EmployerJobOfferItem } from "@/lib/api/job-offer-controller";
import { StatusChip } from "./status-chip";
import {
  JOB_STATUS_LABELS,
  JOB_STATUS_CHIP_CLASSES,
  PAYMENT_FLOW_LABELS,
} from "../config/job-status";

type JobOfferCardProps = {
  readonly offer: EmployerJobOfferItem;
  readonly onClick?: (offer: EmployerJobOfferItem) => void;
};

export function JobOfferCard({ offer, onClick }: Readonly<JobOfferCardProps>) {
  const flowLabel = PAYMENT_FLOW_LABELS[offer.paymentFlow] ?? "";

  return (
    <button
      type="button"
      onClick={() => onClick?.(offer)}
      className={cn(
        "w-full rounded-xl shadow-soft bg-card p-4 text-left",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 font-semibold leading-snug text-foreground">
          {offer.title}
        </h3>
        <StatusChip className={cn("shrink-0", JOB_STATUS_CHIP_CLASSES[offer.status])}>
          {JOB_STATUS_LABELS[offer.status] ?? offer.status}
        </StatusChip>
      </div>

      <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <Coins className="h-4 w-4 shrink-0 text-whatsapp" />
          <span className="font-medium text-foreground">
            {formatAmount(offer.amount)}
          </span>
          {flowLabel && <span>{flowLabel}</span>}
        </p>
        {/* Only a mission closes on a date; a CDI/CDD/STAGE shows its type
            instead of an empty calendar row. */}
        <p className="flex items-center gap-2">
          <Calendar className="h-4 w-4 shrink-0" />
          {offer.scheduledAt
            ? formatDate(offer.scheduledAt)
            : EMPLOYMENT_TYPE_SHORT[offer.employmentType]}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{offer.address}</span>
        </p>
      </div>

      {offer.pendingApplicationsCount > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-whatsapp">
          <Users className="h-3.5 w-3.5" />
          {offer.pendingApplicationsCount} candidature
          {offer.pendingApplicationsCount > 1 ? "s" : ""} en attente
        </div>
      )}
    </button>
  );
}
