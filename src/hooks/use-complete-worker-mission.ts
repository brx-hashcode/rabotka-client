import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  completeWorkerMission,
  rateWorkerMission,
} from "@/lib/api/worker-mission-controller";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

type Vars = {
  id: string;
  score: number;
  /**
   * Whether rating also confirms the work is finished.
   *
   * True on a MISSION, where the worker is the one who knows the job is done
   * and saying so is what completes it. False on a CDD/CDI/STAGE, which has no
   * such moment — the employer already closed the offer by confirming the hire,
   * and `/complete` refuses those types outright, so routing them there would
   * turn "rate your employer" into a 400.
   */
  completes: boolean;
};

/**
 * Worker rates the employer, and on a MISSION confirms the mission is done in
 * the same act.
 *
 * When it completes, it may close the offer outright — so it changes more than
 * the worker's own two screens. One hook over two endpoints rather than two
 * hooks: the difference is which URL is called, and everything after (what to
 * invalidate, what the toast says) is identical.
 */
export function useCompleteWorkerMission() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, score, completes }: Vars) =>
      completes
        ? completeWorkerMission(id, { score })
        : rateWorkerMission(id, { score }),
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
