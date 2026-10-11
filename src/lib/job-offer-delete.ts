/**
 * The employer delete rule, mirrored from the backend (`deleteByEmployer`).
 *
 * An offer can be removed while it is still open (ACTIVE) or dead (EXPIRED)
 * and nobody is engaged on it: no unlock in flight, no hire, no started or
 * finished mission. Candidates still waiting are closed with the offer and
 * notified; rejected or cancelled ones do not count. The backend re-verifies.
 */
const DELETABLE_OFFER_STATUSES = ["ACTIVE", "EXPIRED"];
const ENGAGED_APPLICATION_STATUSES = [
  "WAITING_PAYMENT",
  "ACCEPTED",
  "STARTED",
  "END",
];
const WAITING_APPLICATION_STATUSES = ["PENDING", "VIEWED"];

export function isOfferDeletable(
  offerStatus: string,
  applicationStatuses: readonly string[],
): boolean {
  return (
    DELETABLE_OFFER_STATUSES.includes(offerStatus) &&
    !applicationStatuses.some((s) => ENGAGED_APPLICATION_STATUSES.includes(s))
  );
}

/** How many candidates a delete would close (and notify). */
export function waitingApplicantCount(
  applicationStatuses: readonly string[],
): number {
  return applicationStatuses.filter((s) =>
    WAITING_APPLICATION_STATUSES.includes(s),
  ).length;
}
