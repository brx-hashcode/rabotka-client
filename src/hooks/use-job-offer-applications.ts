import { useQuery } from "@tanstack/react-query";
import { getJobOfferApplications } from "@/lib/api/job-offer-controller";

export function useJobOfferApplications(id: string | undefined) {
  return useQuery({
    queryKey: ["job-offer", id, "applications"],
    queryFn: () => getJobOfferApplications(id as string),
    enabled: Boolean(id),
  });
}
