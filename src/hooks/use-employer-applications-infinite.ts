import { useInfiniteQuery } from "@tanstack/react-query";
import { getEmployerApplications } from "@/lib/api/job-offer-controller";

const DEFAULT_PAGE_SIZE = 5;

// Server-driven pagination for received applications. The client API expects a
// 1-indexed page (converted to 0-indexed inside the controller).
export function useEmployerApplicationsInfinite(pageSize = DEFAULT_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: ["employer", "applications", "infinite", pageSize],
    queryFn: ({ pageParam }) =>
      getEmployerApplications({ page: pageParam, limit: pageSize }),
    initialPageParam: 1,
    getNextPageParam: (_lastPage, allPages) => {
      const loaded = allPages.reduce((n, p) => n + p.data.length, 0);
      const total = allPages[0]?.total ?? 0;
      return loaded < total ? allPages.length + 1 : undefined;
    },
  });
}
