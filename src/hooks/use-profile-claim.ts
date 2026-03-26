import { useQuery } from "@tanstack/react-query";
import { getClaim } from "@/lib/api/claims-controller";

export const useProfileClaim = (claimId: string | undefined) => {
  return useQuery({
    queryKey: ["profile", "claims", claimId],
    queryFn: () => getClaim(claimId!),
    enabled: !!claimId,
  });
};
