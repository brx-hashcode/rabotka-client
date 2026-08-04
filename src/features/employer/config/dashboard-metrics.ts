import type { JobOfferStatus } from "@/lib/api/job-offer-controller";
import type { EmployerJobOfferItem } from "@/lib/api/job-offer-controller";
import type { InvoiceItem } from "@/lib/api/profile-controller";
import type { OfferStage } from "./chart-colors";
import { STAGE_ORDER } from "./chart-colors";

/**
 * Which of the four chart stages a raw offer status belongs to.
 *
 * DRAFT is deliberately absent from the stack: an unpublished offer is not part
 * of the recruiting picture, and folding it into "Ouvertes" would overstate how
 * much is actually live.
 */
const STAGE_BY_STATUS: Partial<Record<JobOfferStatus, OfferStage>> = {
  ACTIVE: "open",
  PARTIALLY_FILLED: "open",
  FILLED: "staffed",
  IN_PROGRESS: "staffed",
  COMPLETED: "done",
  EXPIRED: "closed",
  CANCELLED: "closed",
};

export function stageOf(status: JobOfferStatus): OfferStage | null {
  return STAGE_BY_STATUS[status] ?? null;
}

export type StageCount = { stage: OfferStage; count: number };

/** Offer counts per stage, always in validated slot order, zeroes included. */
export function countByStage(offers: EmployerJobOfferItem[]): StageCount[] {
  const counts = new Map<OfferStage, number>(
    STAGE_ORDER.map((s) => [s, 0]),
  );
  for (const offer of offers) {
    const stage = stageOf(offer.status);
    if (stage) counts.set(stage, (counts.get(stage) ?? 0) + 1);
  }
  return STAGE_ORDER.map((stage) => ({
    stage,
    count: counts.get(stage) ?? 0,
  }));
}

export type FillRate = { filled: number; total: number; ratio: number };

/**
 * Positions filled across the offers that are actively recruiting or staffed.
 *
 * Finished and dead offers are excluded on purpose: including them would drag
 * the ratio toward whatever happened historically, when the question this
 * answers is "am I getting the people I need *right now*".
 */
export function fillRate(offers: EmployerJobOfferItem[]): FillRate {
  let filled = 0;
  let total = 0;
  for (const offer of offers) {
    const stage = stageOf(offer.status);
    if (stage !== "open" && stage !== "staffed") continue;
    filled += offer.acceptedCount;
    total += offer.quantity;
  }
  return { filled, total, ratio: total > 0 ? filled / total : 0 };
}

export type SpendPoint = { key: string; label: string; total: number };

const MONTH_LABELS = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

/**
 * Spend per month over the trailing `months` window, oldest first.
 *
 * Months with no invoices are emitted as zeroes rather than skipped — a gap
 * silently closed up would make spending look continuous when it wasn't, and
 * would put unequal time steps on a time axis.
 */
export function monthlySpend(
  invoices: InvoiceItem[],
  months = 6,
  now = new Date(),
): SpendPoint[] {
  const buckets: SpendPoint[] = [];
  const index = new Map<string, number>();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    index.set(key, buckets.length);
    buckets.push({ key, label: MONTH_LABELS[d.getMonth()], total: 0 });
  }

  for (const invoice of invoices) {
    const d = new Date(invoice.createdAt);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const at = index.get(key);
    if (at === undefined) continue;
    const amount = Number(invoice.amount);
    if (Number.isFinite(amount)) buckets[at].total += amount;
  }

  return buckets;
}
