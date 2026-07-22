import { useQuery } from "@tanstack/react-query";
import { getPublicWorker } from "@/lib/api/public-worker-controller";

export function usePublicWorker(slug: string | undefined) {
  return useQuery({
    queryKey: ["public-worker", slug],
    queryFn: () => getPublicWorker(slug!),
    enabled: !!slug,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
