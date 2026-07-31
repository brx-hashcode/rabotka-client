import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getEmployerJobOffers,
  type JobOfferStatus,
} from "@/lib/api/job-offer-controller";

const DEFAULT_PAGE_SIZE = 5;

/**
 * Server-driven pagination: the backend returns `pageSize` offers per page
 * (page is 0-indexed) plus a `total`. "Load more" fetches the next page.
 *
 * Pass `statuses` to narrow the list — it is applied server-side, before
 * pagination. Filtering the returned pages client-side instead would hand back
 * short pages (5 fetched, 1 kept) and a `total` that counts rows the user never
 * sees, which also breaks the "load more" affordance.
 */
export function useEmployerJobOffersInfinite(
  statuses?: readonly JobOfferStatus[],
  pageSize = DEFAULT_PAGE_SIZE,
) {
  return useInfiniteQuery({
    queryKey: ["employer", "job-offers", "infinite", pageSize, statuses ?? null],
    queryFn: ({ pageParam }) =>
      getEmployerJobOffers({ page: pageParam, limit: pageSize, statuses }),
    initialPageParam: 0,
    getNextPageParam: (_lastPage, allPages) => {
      const loaded = allPages.reduce((n, p) => n + p.data.length, 0);
      const total = allPages[0]?.total ?? 0;
      return loaded < total ? allPages.length : undefined;
    },
  });
}
