import { useQuery } from "@tanstack/react-query";
import { getWorkerMission } from "@/lib/api/worker-mission-controller";

export function useWorkerMission(id: string | undefined) {
  return useQuery({
    queryKey: ["worker", "mission", id],
    queryFn: () => getWorkerMission(id as string),
    enabled: Boolean(id),
  });
}
