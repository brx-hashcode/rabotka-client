import { useProfileMe } from "./use-profile-me";

export type AccountBlockReason = "SUSPENDED" | "BANNED" | "PENDING_ACTIVATION";

export type AccountGate = {
  isLoading: boolean;
  isActive: boolean;
  isSuspended: boolean;
  isBanned: boolean;
  /** True when the current profile may browse but not apply, hire, or publish. */
  blocked: boolean;
  /** Which copy to show. Null when nothing is blocked. */
  reason: AccountBlockReason | null;
};

/**
 * Whether the current account is in good standing.
 *
 * The account-status twin of `useKycGate`: same shape, same cache read off the
 * profile query, same optimistic-while-loading stance. Kept separate because a
 * suspension and an unverified identity are different problems with different
 * remedies — and a suspended worker keeps full read access (feed, search,
 * detail, saved offers), only the apply action goes away.
 *
 * Anything other than ACTIVE blocks, which matches the server:
 * `ApplicationService.create` refuses every non-ACTIVE worker, so the worst case
 * here is a button that briefly looks enabled while the profile loads.
 */
export function useAccountGate(): AccountGate {
  const { data: profile, isLoading } = useProfileMe();
  const status = profile?.status;

  const isActive = status === "ACTIVE";
  const isSuspended = status === "SUSPENDED";
  const isBanned = status === "BANNED";
  const blocked = !isLoading && status !== undefined && !isActive;

  let reason: AccountBlockReason | null = null;
  if (blocked) {
    if (isBanned) reason = "BANNED";
    else if (isSuspended) reason = "SUSPENDED";
    else reason = "PENDING_ACTIVATION";
  }

  return { isLoading, isActive, isSuspended, isBanned, blocked, reason };
}
