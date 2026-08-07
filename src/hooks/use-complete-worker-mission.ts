import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { completeWorkerMission } from "@/lib/api/worker-mission-controller";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

/**
 * Worker confirms their mission is done and rates the employer.
 *
 * This is the only thing that completes a mission, and it may close the offer
 * outright when no other hired worker is still outstanding — so it changes more
 * than the worker's own two screens.
 */
export function useCompleteWorkerMission() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, score }: { id: string; score: number }) =>
      completeWorkerMission(id, { score }),
    onSuccess: (_data, { id }) => {
      // `refetchType: "all"` throughout: the app runs inside WhatsApp's webview,
      // which fires no focus or reconnect events, so a query merely marked stale
      // stays stale until a manual reload.
      queryClient.invalidateQueries({
        queryKey: ["worker", "mission", id],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["worker", "missions"],
        refetchType: "all",
      });
      // The offer may have just closed, and this is also what unlocks the
      // employer's rating action — so anything showing offer state has to
      // catch up too.
      queryClient.invalidateQueries({
        queryKey: ["job-offer"],
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
