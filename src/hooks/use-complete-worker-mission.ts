import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { completeWorkerMission } from "@/lib/api/worker-mission-controller";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

/**
 * Worker marks their side of a mission done and rates the employer. Refreshes the
 * worker's mission detail + list.
 */
export function useCompleteWorkerMission() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, score }: { id: string; score: number }) =>
      completeWorkerMission(id, { score }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["worker", "mission", id] });
      queryClient.invalidateQueries({
        queryKey: ["worker", "missions"],
        refetchType: "all",
      });
      toast({ description: "Merci ! Votre évaluation a été enregistrée." });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: errorMessage(error, "Échec de l'évaluation."),
      });
    },
  });
}
