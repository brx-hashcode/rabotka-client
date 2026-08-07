import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { rateWorker } from "@/lib/api/application-controller";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

type Vars = {
  applicationId: string;
  offerId: string;
  score: number;
  note?: string;
};

/**
 * Employer rates the worker on a finished mission.
 *
 * Rating only — the employer no longer closes anything. The worker is the one
 * who confirms the mission is done, and the API refuses this until they have;
 * that refusal surfaces here as the server's own message.
 */
export function useRateWorker() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ applicationId, score, note }: Vars) =>
      rateWorker(applicationId, { score, note }),
    onSuccess: (_data, { offerId }) => {
      // `["job-offer", offerId]` is a prefix, so this also covers
      // `["job-offer", offerId, "applications"]` — the workers list that
      // carries `ratedByEmployer` and therefore decides whether the rating
      // button is still on screen. `refetchType: "all"` because this app runs
      // in WhatsApp's webview, which fires no focus or reconnect events: an
      // inactive query marked stale would otherwise stay stale until a manual
      // reload.
      queryClient.invalidateQueries({
        queryKey: ["job-offer", offerId],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["employer", "job-offers"],
        refetchType: "all",
      });
      toast({ description: "Travailleur noté." });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: errorMessage(error, "Échec de la notation."),
      });
    },
  });
}
