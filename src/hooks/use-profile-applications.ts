import { useQuery } from "@tanstack/react-query";
import { getApplications } from "@/lib/api/profile-controller";

type UseProfileApplicationsParams = {
  page?: number;
  limit?: number;
  enabled?: boolean;
};

export function useProfileApplications({
  page = 1,
  limit = 10,
  enabled = true,
}: UseProfileApplicationsParams = {}) {
  return useQuery({
    queryKey: ["profile", "applications", page, limit],
    queryFn: () => getApplications(page, limit),
    enabled,
  });
}

