import { useQuery } from "@tanstack/react-query";
import { getApplicationTerms } from "@/lib/api/system-config-controller";

/**
 * Penalty and threshold shown before a worker confirms an application.
 *
 * Read from the server rather than hardcoded so the figures the worker agrees
 * to are the ones actually enforced on a late cancellation. They change rarely,
 * hence the long stale time.
 */
export function useApplicationTerms() {
  return useQuery({
    queryKey: ["public", "application-terms"],
    queryFn: getApplicationTerms,
    staleTime: 60 * 60 * 1000,
  });
}
