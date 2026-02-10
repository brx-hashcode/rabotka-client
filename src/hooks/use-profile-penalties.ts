import { useQuery } from "@tanstack/react-query";
import { getPenalties } from "@/lib/api/profile-controller";

type UseProfilePenaltiesParams = {
  enabled?: boolean;
};

export function useProfilePenalties({
  enabled = true,
}: UseProfilePenaltiesParams = {}) {
  return useQuery({
    queryKey: ["profile", "penalties"],
    queryFn: getPenalties,
    enabled,
  });
}

