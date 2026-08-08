/**
 * What kind of engagement a job offer is.
 *
 * Mirrors the backend `EmploymentType` enum. Defined once and imported
 * everywhere: the payment-flow equivalent ended up as two divergent label maps
 * and three hardcoded value lists, and this is the same shape of data.
 *
 * Labels are the uppercase enum values themselves, matching the admin exactly.
 * "CDI" and "CDD" are acronyms that are always written uppercase, so casing
 * MISSION and STAGE differently made the set look like two unrelated things —
 * and the client and back office had drifted to different casings besides.
 */
export const EMPLOYMENT_TYPE_VALUES = [
  "MISSION",
  "CDD",
  "CDI",
  "STAGE",
] as const;

export type EmploymentTypeValue = (typeof EMPLOYMENT_TYPE_VALUES)[number];

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentTypeValue, string> = {
  MISSION: "MISSION",
  CDD: "CDD",
  CDI: "CDI",
  STAGE: "STAGE",
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
