import { useProfileMe } from "./use-profile-me";

/**
 * MISSING: signed up without identity documents (« Plus tard ») — nothing is
 * under review, the person has to send them. PENDING: sent, under review (and
 * any status this client does not know yet). REJECTED: refused, new ones can
 * be sent.
 */
export type KycBlockReason = "PENDING" | "REJECTED" | "MISSING";

/** Which copy a not-verified status gets. */
export function kycBlockReason(
  status: string | null | undefined,
): KycBlockReason {
  if (status === "REJECTED") return "REJECTED";
  if (status === "NOT_SUBMITTED") return "MISSING";
  return "PENDING";
}

export type KycGate = {
  isLoading: boolean;
  isVerified: boolean;
  isPending: boolean;
  isRejected: boolean;
  /** Signed up without identity documents: they have to be sent. */
  isMissing: boolean;
  /** True when the current profile may not apply, hire, or publish. */
  blocked: boolean;
  /** Which copy to show. Null when nothing is blocked. */
  reason: KycBlockReason | null;
};

/**
 * Whether the current profile has cleared KYC.
 *
 * Reads `verificationStatus` off the profile query that is already in the cache
 * (every gated screen renders under AuthGuard, which waits on it), so this
 * costs no extra request.
 *
 * Optimistic while loading — `blocked` stays false — matching how `useCanApply`
 * treats an in-flight quota. Safe because the server enforces the same rule via
 * KycVerifiedGuard, so the worst case is a button that briefly looks enabled.
 */
export function useKycGate(): KycGate {
  const { data: profile, isLoading } = useProfileMe();
  const status = profile?.verificationStatus;

  const isVerified = status === "VERIFIED";
  const isPending = status === "PENDING";
  const isRejected = status === "REJECTED";
  const isMissing = status === "NOT_SUBMITTED";
  const blocked = !isLoading && status != null && !isVerified;

  const reason: KycBlockReason | null = blocked ? kycBlockReason(status) : null;

  return {
    isLoading,
    isVerified,
    isPending,
    isRejected,
    isMissing,
    blocked,
    reason,
  };
}
