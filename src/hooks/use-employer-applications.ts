import { useQuery } from "@tanstack/react-query";
import { getEmployerApplications } from "@/lib/api/job-offer-controller";

export function useEmployerApplications(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["employer", "applications", page, limit],
    queryFn: () => getEmployerApplications({ page, limit }),
  });
}
