import { useQuery } from "@tanstack/react-query";
import { listClaims } from "@/lib/api/claims-controller";

export const useProfileClaims = (
  { page = 1, limit = 10, enabled = true }: { page?: number; limit?: number; enabled?: boolean } = {},
) => {
  return useQuery({
    queryKey: ["profile", "claims", page, limit],
    queryFn: () => listClaims(page, limit),
    enabled,
  });
};
