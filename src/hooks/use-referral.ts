import { useQuery } from "@tanstack/react-query";
import { getReferralSummary } from "@/lib/api/referral-controller";

type UseReferralParams = {
  enabled?: boolean;
};

/**
 * The user's parrainage code, the current amounts, and their counts.
 *
 * Amounts come from the server rather than being hardcoded here because they
 * live in SystemConfig and an admin can change them without a deploy — a
 * hardcoded "500 FCFA" in the share sheet would start lying the moment they do.
 *
 * `enabled` is threaded through so the sheet only fetches when opened: this
 * call mints the code on first use, and every profile visit should not.
 */
export function useReferral({ enabled = true }: UseReferralParams = {}) {
  return useQuery({
    queryKey: ["profile", "referral"],
    queryFn: getReferralSummary,
    enabled,
  });
}
