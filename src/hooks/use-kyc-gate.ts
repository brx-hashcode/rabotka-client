import { useProfileMe } from "./use-profile-me";

export type KycBlockReason = "PENDING" | "REJECTED";

export type KycGate = {
  isLoading: boolean;
  isVerified: boolean;
  isPending: boolean;
  isRejected: boolean;
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
  const blocked = !isLoading && status !== undefined && !isVerified;

  let reason: KycBlockReason | null = null;
  if (blocked) reason = isRejected ? "REJECTED" : "PENDING";

  return { isLoading, isVerified, isPending, isRejected, blocked, reason };
}
