import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  searchWorkers,
  getJobCategories,
  type WorkerSearchParams,
} from "@/lib/api/worker-search-controller";

const PAGE_SIZE = 15;

type Filters = Omit<WorkerSearchParams, "page" | "pageSize">;

export function useWorkerSearch(filters: Filters) {
  return useInfiniteQuery({
    queryKey: ["worker-search", filters],
    queryFn: ({ pageParam }) =>
      searchWorkers({ ...filters, page: pageParam, pageSize: PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (_lastPage, allPages) => {
      const loaded = allPages.reduce((n, p) => n + p.items.length, 0);
      const total = allPages[0]?.total ?? 0;
      return loaded < total ? allPages.length : undefined;
    },
  });
}

export function useJobCategories() {
  return useQuery({
    queryKey: ["job-categories"],
    queryFn: getJobCategories,
    staleTime: 10 * 60 * 1000,
  });
}
