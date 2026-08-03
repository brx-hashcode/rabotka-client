import { useQuery } from "@tanstack/react-query";
import { getEmployerJobOffers } from "@/lib/api/job-offer-controller";

export function useEmployerJobOffers(limit = 10) {
  return useQuery({
    queryKey: ["employer", "job-offers", limit],
    queryFn: () => getEmployerJobOffers({ limit }),
  });
}

/**
 * Every offer the employer has, for aggregate figures.
 *
 * The dashboard used to count "offres actives" from a 5-item page, so the KPI
 * silently capped at 5 and any chart built on it would have been wrong in the
 * same way. 100 is the backend's own pageSize ceiling.
 */
export const DASHBOARD_OFFERS_LIMIT = 100;

export function useAllEmployerJobOffers() {
  return useEmployerJobOffers(DASHBOARD_OFFERS_LIMIT);
}
