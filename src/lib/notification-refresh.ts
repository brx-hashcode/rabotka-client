import type { QueryClient, QueryKey } from "@tanstack/react-query";

/**
 * What a pushed notification is about, as the socket hands it over:
 * `metadata` is the notification's own input (applicationId, jobOfferId…).
 */
export type PushedNotification = {
  type?: string;
  metadata?: Record<string, unknown> | null;
};

const id = (n: PushedNotification, key: string) => {
  const v = n.metadata?.[key];
  return typeof v === "string" && v ? v : null;
};

// The worker's side of an application: its mission, its list, its offer.
const WORKER_APPLICATION: QueryKey[] = [
  ["worker", "missions"],
  ["worker", "mission"],
  ["worker-mission"],
  ["profile", "applications"],
  ["job-detail"],
  ["job-feed"],
];
// The employer's side: its offers and who applied.
const EMPLOYER_APPLICATION: QueryKey[] = [
  ["employer", "applications"],
  ["employer", "job-offers"],
  ["job-offer"],
  ["application"],
];
const MONEY: QueryKey[] = [
  ["profile", "wallet"],
  ["profile", "invoices"],
  ["profile", "contacts"],
  ["profile", "penalties"],
  ["profile", "me"],
];

/**
 * Every notification refreshes what it is about, so the screen behind it is
 * never older than the bell: the mission a worker was retained for, the
 * applicants of an employer's offer, the wallet after a payment. An unknown
 * type refreshes both sides of an application: nothing is less fresh than if
 * the screens had been reopened.
 */
export function refreshKeysFor(n: PushedNotification): QueryKey[] {
  const keys: QueryKey[] = [["notifications"]];
  const add = (...more: QueryKey[]) => keys.push(...more);
  const offer = id(n, "jobOfferId");
  switch (n.type) {
    // About a worker's own application.
    case "APPLICATION_ACCEPTED":
    case "APPLICATION_REJECTED":
    case "HIRE_CANCELLED":
    case "INTERVIEW_INVITED":
    case "INTERVIEW_CANCELLED":
    case "MISSION_REMINDER":
    case "MISSION_STARTED":
    case "MISSION_STATUS_CHECK":
      add(...WORKER_APPLICATION);
      break;
    // About an employer's offer: someone applied, cancelled, an answer came.
    case "NEW_APPLICATION":
    case "APPLICATION_CANCELLED":
    case "INTERVIEW_ANSWERED":
      add(...EMPLOYER_APPLICATION);
      break;
    // Both sides can receive these.
    case "MISSION_COMPLETED":
    case "MISSION_RATED":
    case "CONTACT_UNLOCKED":
    case "PAYMENT_SUCCEEDED":
    case "PAYMENT_FAILED":
    case "UNLOCK_CONVERTED_TO_CREDIT":
      add(...WORKER_APPLICATION, ...EMPLOYER_APPLICATION, ...MONEY);
      break;
    case "JOB_OFFER_UPDATED":
    case "JOB_OFFER_EXPIRED":
    case "JOB_OFFER_EXPIRING":
    case "JOB_INVITATION":
    case "JOB_RECOMMENDATION":
    case "SIMILAR_PROFILE_HIRED":
      add(["job-feed"], ["job-detail"], ["saved-jobs"], ["employer", "job-offers"], ...WORKER_APPLICATION);
      if (offer) add(["job-offer", offer]);
      break;
    case "NEW_MESSAGE":
      add(["discussions"]);
      break;
    case "CLAIM_STATUS_CHANGED":
    case "CLAIM_COMMENTED":
      add(["profile", "claims"]);
      break;
    case "KYC_REJECTED":
    case "ACCOUNT_SUSPENDED":
      add(["profile", "me"]);
      break;
    case "ANNOUNCEMENT":
    case "PROFILE_VIEW":
      break;
    default:
      add(...WORKER_APPLICATION, ...EMPLOYER_APPLICATION);
  }
  return keys;
}

export function refreshFor(queryClient: QueryClient, n: PushedNotification): void {
  for (const queryKey of refreshKeysFor(n)) void queryClient.invalidateQueries({ queryKey });
}
