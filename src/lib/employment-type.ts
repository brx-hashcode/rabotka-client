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
 * Whether the offer's date is a *start time* rather than a closing deadline.
 *
 * Every offer carries a `scheduledAt`, meaning "the day this offer stops being
 * open". On a MISSION that is also the day the work happens, so it drives the
 * reminders, the auto-start and the worker's own "I finished" confirmation. On
 * the other three it is only an application deadline — a CDI whose window has
 * closed has not begun.
 *
 * Defaults to MISSION, and every caller must keep it that way: an unrecognised
 * type has to behave as it always has, never silently take the newer branch.
 *
 * Written as "not one of the ongoing three" rather than `(type ?? "MISSION")`
 * on purpose. `??` falls back only on null and undefined, so an empty string —
 * a form default, a half-built payload — would have sailed past it and been
 * read as an ongoing engagement, which is the unsafe direction: the offer stops
 * getting its reminders and its worker loses the ability to confirm the work.
 */
export function isDatedMission(
  type: EmploymentTypeValue | string | null | undefined,
): boolean {
  return type !== "CDD" && type !== "CDI" && type !== "STAGE";
}

/**
 * Whether filling every position is what ends this offer's life.
 *
 * For a CDD, CDI or stage, Rabotka's part is the hiring: the offer closes once
 * the positions are taken and the employer confirms the hire stuck. A MISSION
 * runs to its date and is closed by its worker confirming the work is done.
 */
export function closesOnFill(
  type: EmploymentTypeValue | string | null | undefined,
): boolean {
  return !isDatedMission(type);
}

/**
 * Whether the *worker* is the one who marks this finished.
 *
 * Only on a MISSION. An ongoing engagement has no moment the worker could
 * confirm — the work carries on off-platform indefinitely — so the API refuses
 * it, and offering the action would produce an error they cannot act on.
 */
export const isCompletable = isDatedMission;

/**
 * What to call the date on the create form and the detail screens.
 *
 * One field, two meanings, and the wrong label is not cosmetic: asking an
 * employer for "la date de la mission" on a CDI is how you get one invented.
 */
export function scheduledAtLabel(
  type: EmploymentTypeValue | string | null | undefined,
): string {
  return isDatedMission(type) ? "Date de la mission" : "Ouverte jusqu'au";
}

export function scheduledAtHelpText(
  type: EmploymentTypeValue | string | null | undefined,
): string {
  return isDatedMission(type)
    ? "Le jour où la mission a lieu. Les candidatures se ferment à cette date."
    : "Dernier jour pour recevoir des candidatures. L'offre expire ensuite si personne n'a été recruté.";
}
