import { useInfiniteQuery } from "@tanstack/react-query";
import { getWorkerMissions } from "@/lib/api/worker-mission-controller";

const DEFAULT_PAGE_SIZE = 10;

// Server-driven pagination (page 0-indexed) of the worker's own missions.
export function useWorkerMissions(pageSize = DEFAULT_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: ["worker", "missions", pageSize],
    queryFn: ({ pageParam }) =>
      getWorkerMissions({ page: pageParam, pageSize }),
    initialPageParam: 0,
    getNextPageParam: (_lastPage, allPages) => {
      const loaded = allPages.reduce((n, p) => n + p.items.length, 0);
      const total = allPages[0]?.total ?? 0;
      return loaded < total ? allPages.length : undefined;
    },
  });
}
