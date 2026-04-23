import { useQuery } from "@tanstack/react-query";
import { getEmployerJobOffers } from "@/lib/api/job-offer-controller";

export function useEmployerJobOffers(limit = 10) {
  return useQuery({
    queryKey: ["employer", "job-offers", limit],
    queryFn: () => getEmployerJobOffers({ limit }),
  });
}
