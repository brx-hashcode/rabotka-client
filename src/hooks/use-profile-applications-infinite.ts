import { useInfiniteQuery } from "@tanstack/react-query";
import { getApplications } from "@/lib/api/profile-controller";

// Server-driven pagination (page is 1-indexed) of the worker's own applications.
// Appends each next page instead of refetching the whole list.
export function useProfileApplicationsInfinite(pageSize = 5) {
  return useInfiniteQuery({
    queryKey: ["profile", "applications", "infinite", pageSize],
    queryFn: ({ pageParam }) => getApplications(pageParam, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((n, p) => n + p.data.length, 0);
      return loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
  });
}
