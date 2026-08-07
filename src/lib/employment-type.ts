/**
 * What kind of engagement a job offer is.
 *
 * Mirrors the backend `EmploymentType` enum. Defined once and imported
 * everywhere: the payment-flow equivalent ended up as two divergent label maps
 * and three hardcoded value lists, and this is the same shape of data.
 */
export const EMPLOYMENT_TYPE_VALUES = [
  "MISSION",
  "CDD",
  "CDI",
  "STAGE",
] as const;

export type EmploymentTypeValue = (typeof EMPLOYMENT_TYPE_VALUES)[number];

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentTypeValue, string> = {
  MISSION: "Mission ponctuelle",
  CDD: "CDD",
  CDI: "CDI",
  STAGE: "Stage",
};

/** Short form for cards and list rows, where the full label is too long. */
export const EMPLOYMENT_TYPE_SHORT: Record<EmploymentTypeValue, string> = {
  MISSION: "Mission",
  CDD: "CDD",
  CDI: "CDI",
  STAGE: "Stage",
};

/**
 * Only a one-off gig has a closing date, and only a one-off gig can be marked
 * finished. Both rules come from the same fact, so they share one predicate —
 * the backend keeps the matching `requiresClosingDate`.
 */
export function requiresClosingDate(
  type: EmploymentTypeValue | string | null | undefined,
): boolean {
  return (type ?? "MISSION") === "MISSION";
}

/** A CDI/CDD/STAGE is an ongoing engagement with no moment to confirm. */
export const isCompletable = requiresClosingDate;
