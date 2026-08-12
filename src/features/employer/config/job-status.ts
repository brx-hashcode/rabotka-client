import type { JobOfferStatus } from "@/lib/api/job-offer-controller";
import { closesOnFill } from "@/lib/employment-type";

// Feminine agreement — a job posting is "une offre" / "une mission".
export const JOB_STATUS_LABELS: Record<JobOfferStatus, string> = {
  DRAFT: "Brouillon",
  ACTIVE: "Ouverte",
  PARTIALLY_FILLED: "Partiellement pourvue",
  FILLED: "Pourvue",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminée",
  EXPIRED: "Expirée",
  CANCELLED: "Annulée",
};

/**
 * The status label, corrected for what COMPLETED means on this type of offer.
 *
 * On a MISSION it means the work was done, and "Terminée" is right. On a
 * CDD/CDI/STAGE it means recruiting is over and the employer confirmed the
 * hire — the job itself is just beginning. Telling an employer their new
 * permanent role is "Terminée" reads as though something went wrong.
 */
export function jobStatusLabel(
  status: JobOfferStatus,
  employmentType?: string | null,
): string {
  if (status === "COMPLETED" && closesOnFill(employmentType)) {
    return "Pourvue";
  }
  return JOB_STATUS_LABELS[status] ?? status;
}

export function getJobStatusVariant(
  status: JobOfferStatus,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "ACTIVE" || status === "PARTIALLY_FILLED") return "default";
  if (status === "FILLED" || status === "IN_PROGRESS") return "secondary";
  if (status === "EXPIRED" || status === "CANCELLED") return "destructive";
  return "outline";
}

// Borderless, softly-tinted, colour-coded status chips (no `border`, small
// rounding) — used in place of the default Badge for a cleaner look.
export const JOB_STATUS_CHIP_CLASSES: Record<JobOfferStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  ACTIVE: "bg-whatsapp/10 text-whatsapp",
  PARTIALLY_FILLED: "bg-whatsapp/10 text-whatsapp",
  FILLED: "bg-sky-500/10 text-sky-600",
  IN_PROGRESS: "bg-amber-500/15 text-amber-700",
  COMPLETED: "bg-emerald-500/10 text-emerald-600",
  EXPIRED: "bg-muted text-muted-foreground",
  CANCELLED: "bg-red-500/10 text-red-600",
};

// A "mission en cours" is an offer where workers are locked in and the job is
// underway (or about to be) — as opposed to still-open or finished offers.
export const ONGOING_STATUSES: readonly JobOfferStatus[] = [
  "PARTIALLY_FILLED",
  "FILLED",
  "IN_PROGRESS",
];

export const isOngoing = (status: JobOfferStatus): boolean =>
  ONGOING_STATUSES.includes(status);

/**
 * Offers that can take no further candidates. FILLED is the authoritative
 * signal: the backend flips an offer to FILLED the moment its accepted count
 * reaches `quantity`, and rejects any later accept with a 409.
 *
 * Deliberately narrow. PARTIALLY_FILLED still has room, and the backend also
 * still permits accepting from an EXPIRED offer — so neither is listed here.
 * Hiding an action the server would allow is the worse failure.
 */
const CLOSED_TO_NEW_CANDIDATES = new Set<JobOfferStatus>([
  "FILLED",
  "COMPLETED",
  "CANCELLED",
]);

export const isClosedToNewCandidates = (status: JobOfferStatus): boolean =>
  CLOSED_TO_NEW_CANDIDATES.has(status);

/**
 * Offers a worker may still apply to.
 *
 * Deliberately an allowlist, unlike `isClosedToNewCandidates`: the backend's
 * apply guard admits only ACTIVE and PARTIALLY_FILLED and rejects everything
 * else with "Cette offre n'est plus disponible" — a stricter rule than the one
 * governing an employer accepting an existing candidature. The two must not be
 * collapsed into one predicate.
 */
const OPEN_TO_APPLICATIONS = new Set<JobOfferStatus>([
  "ACTIVE",
  "PARTIALLY_FILLED",
]);

export function isClosedToApplications(offer: {
  status: JobOfferStatus;
  acceptedCount?: number;
  quantity?: number;
}): boolean {
  if (!OPEN_TO_APPLICATIONS.has(offer.status)) return true;
  // Secondary guard: a feed row cached just before the offer filled up still
  // reads PARTIALLY_FILLED, but its own counts already say there is no room.
  const { acceptedCount, quantity } = offer;
  return (
    typeof acceptedCount === "number" &&
    typeof quantity === "number" &&
    quantity > 0 &&
    acceptedCount >= quantity
  );
}

/**
 * Why an offer can no longer take candidates, in the employer's words. Null when
 * it still can. Distinct from JOB_STATUS_LABELS, which names the state rather
 * than explaining the consequence.
 */
export function closedToCandidatesReason(
  status: JobOfferStatus,
  employmentType?: string | null,
): string | null {
  if (status === "FILLED") return "Tous les postes de cette offre sont pourvus.";
  if (status === "COMPLETED") {
    // Same distinction as jobStatusLabel: "terminée" describes work that
    // happened, which is not what closing an ongoing engagement means.
    return closesOnFill(employmentType)
      ? "Le recrutement pour cette offre est clôturé."
      : "Cette offre est terminée.";
  }
  if (status === "CANCELLED") return "Cette offre a été annulée.";
  return null;
}

export const PAYMENT_FLOW_LABELS: Record<string, string> = {
  HOURLY: "par heure",
  DAILY: "par jour",
  MONTHLY: "par mois",
};

// Feminine agreement — "une candidature".
export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  VIEWED: "Vue",
  WAITING_PAYMENT: "Paiement requis",
  ACCEPTED: "Acceptée",
  STARTED: "En cours",
  END: "Terminée",
  REJECTED: "Refusée",
  CANCELLED: "Annulée",
};

export function getApplicationStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "ACCEPTED" || status === "STARTED") return "default";
  if (status === "PENDING" || status === "VIEWED") return "secondary";
  if (status === "REJECTED" || status === "CANCELLED") return "destructive";
  return "outline";
}

export const APPLICATION_STATUS_CHIP_CLASSES: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-700",
  VIEWED: "bg-muted text-muted-foreground",
  WAITING_PAYMENT: "bg-amber-500/15 text-amber-700",
  ACCEPTED: "bg-whatsapp/10 text-whatsapp",
  STARTED: "bg-amber-500/15 text-amber-700",
  END: "bg-emerald-500/10 text-emerald-600",
  REJECTED: "bg-red-500/10 text-red-600",
  CANCELLED: "bg-red-500/10 text-red-600",
};

export function getApplicationStatusChipClass(status: string): string {
  return APPLICATION_STATUS_CHIP_CLASSES[status] ?? "bg-muted text-muted-foreground";
}
