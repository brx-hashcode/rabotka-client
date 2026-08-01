import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getJobFeed,
  getJobDetail,
  applyToJob,
  getDailyQuota,
  saveJob,
  unsaveJob,
  getSavedJobs,
  searchJobs,
  type JobFeedItem,
  type DailyQuota,
  type JobSearchParams,
  type JobSearchResponse,
} from "@/lib/api/job-feed-controller";

export const JOB_SEARCH_KEY = "job-search";
const SEARCH_PAGE_SIZE = 15;

// Personalized (or category-filtered) job feed. Grow-limit + keepPreviousData so
// the list stays visible while a larger page loads (mirrors useWorkerFeed).
export function useJobFeed(limit = 10, categoryId: string | null = null) {
  return useQuery({
    queryKey: ["job-feed", limit, categoryId],
    queryFn: () => getJobFeed({ limit, categoryId }),
    placeholderData: keepPreviousData,
  });
}

export function useJobDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["job-detail", id],
    queryFn: () => getJobDetail(id as string),
    enabled: Boolean(id),
  });
}

export function useDailyQuota() {
  return useQuery({
    queryKey: ["daily-quota"],
    queryFn: getDailyQuota,
    staleTime: 30 * 1000,
  });
}

/**
 * Whether the worker may still apply. Both caps come from SystemConfig
 * (`fees.max_daily_applications` and `fees.max_concurrent_applications`) via the
 * quota endpoint — never hardcode either here. Either cap blocks. Optimistic
 * while the quota is still in flight; the server re-checks on apply anyway.
 */
export function useCanApply() {
  const { data: quota, isLoading } = useDailyQuota();
  const canApply =
    quota == null
      ? true
      : quota.remaining > 0 && (quota.concurrent?.remaining ?? 1) > 0;
  return { canApply, quota, isLoading };
}

export function useApplyToJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobOfferId: string) => applyToJob(jobOfferId),
    onSuccess: ({ dailyQuota }) => {
      qc.setQueryData(["daily-quota"], dailyQuota);
      qc.invalidateQueries({ queryKey: ["job-feed"] });
      qc.invalidateQueries({ queryKey: ["saved-jobs"] });
      // Without this, applying from a search result leaves its button on "Postuler".
      qc.invalidateQueries({ queryKey: [JOB_SEARCH_KEY] });
      toast.success("Candidature envoyée !");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Impossible de postuler."),
  });
}

// Optimistically flip the `saved` flag on every cached feed list + the detail.
// Three shapes to cover: the feed's flat array, the detail object, and the
// search's paged InfiniteData — miss the last one and bookmarking from a search
// result silently no-ops (the patch AND the onError revert both fail to land).
function patchSavedFlag(
  qc: ReturnType<typeof useQueryClient>,
  jobOfferId: string,
  saved: boolean,
) {
  qc.setQueriesData<JobFeedItem[]>({ queryKey: ["job-feed"] }, (old) =>
    old?.map((j) => (j.id === jobOfferId ? { ...j, saved } : j)),
  );
  qc.setQueryData<JobFeedItem>(["job-detail", jobOfferId], (old) =>
    old ? { ...old, saved } : old,
  );
  qc.setQueriesData<InfiniteData<JobSearchResponse>>(
    { queryKey: [JOB_SEARCH_KEY] },
    (old) =>
      old && {
        ...old,
        pages: old.pages.map((p) => ({
          ...p,
          items: p.items.map((j) =>
            j.id === jobOfferId ? { ...j, saved } : j,
          ),
        })),
      },
  );
}

export function useToggleSaveJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobOfferId, saved }: { jobOfferId: string; saved: boolean }) =>
      saved ? unsaveJob(jobOfferId) : saveJob(jobOfferId),
    onMutate: async ({ jobOfferId, saved }) => {
      patchSavedFlag(qc, jobOfferId, !saved);
    },
    onError: (err: Error, { jobOfferId, saved }) => {
      patchSavedFlag(qc, jobOfferId, saved); // revert
      toast.error(err.message || "Action impossible.");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["saved-jobs"] });
    },
  });
}

export function useSavedJobs(pageSize = 10) {
  return useInfiniteQuery({
    queryKey: ["saved-jobs", pageSize],
    queryFn: ({ pageParam }) => getSavedJobs({ page: pageParam, pageSize }),
    initialPageParam: 0,
    getNextPageParam: (_lastPage, allPages) => {
      const loaded = allPages.reduce((n, p) => n + p.items.length, 0);
      const total = allPages[0]?.total ?? 0;
      return loaded < total ? allPages.length : undefined;
    },
  });
}

/** Filters for useJobSearch — pagination is supplied by the hook itself. */
export type JobSearchFiltersParam = Omit<JobSearchParams, "page" | "pageSize">;

/**
 * Server-side job search. Build `filters` with `undefined` (not "" or null) for
 * empty values so the query key stays stable across a nuqs empty-string
 * round-trip, otherwise every clear refetches under a new key.
 */
export function useJobSearch(filters: JobSearchFiltersParam) {
  return useInfiniteQuery({
    queryKey: [JOB_SEARCH_KEY, filters],
    queryFn: ({ pageParam }) =>
      searchJobs({ ...filters, page: pageParam, pageSize: SEARCH_PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (_lastPage, allPages) => {
      const loaded = allPages.reduce((n, p) => n + p.items.length, 0);
      const total = allPages[0]?.total ?? 0;
      return loaded < total ? allPages.length : undefined;
    },
  });
}

export type { JobFeedItem, DailyQuota };
