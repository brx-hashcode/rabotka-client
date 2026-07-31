import { useQuery } from "@tanstack/react-query";
import { getJobOffer } from "@/lib/api/job-offer-controller";

export function useJobOffer(id: string | undefined) {
  return useQuery({
    queryKey: ["job-offer", id],
    queryFn: () => getJobOffer(id as string),
    enabled: Boolean(id),
  });
}
