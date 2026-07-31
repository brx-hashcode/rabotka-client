import type { JobOfferStatus } from "@/lib/api/job-offer-controller";

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
