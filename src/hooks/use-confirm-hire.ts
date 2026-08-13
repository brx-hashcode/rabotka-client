import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { confirmHire } from "@/lib/api/job-offer-controller";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

/**
 * Employer confirms the people they hired actually took the job.
 *
 * This is what closes a CDD/CDI/STAGE offer, and the only thing that opens the
 * mutual rating on one. There is no equivalent on a MISSION: there the worker
 * confirms the work is done, because they are the one who knows.
 *
 * Nothing about it is destructive — it stops an offer that is already full from
 * lingering — so it is a single tap with no confirmation dialog. If the hire
 * later falls through, either side can undo it and the offer reopens.
 */
export function useConfirmHire() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (offerId: string) => confirmHire(offerId),
    onSuccess: (_data, offerId) => {
      // `["job-offer", offerId]` is a prefix, so this also covers
      // `["job-offer", offerId, "applications"]` — the workers list whose
      // statuses decide whether the rating button appears. `refetchType: "all"`
      // because this app runs inside WhatsApp's webview, which fires no focus
      // or reconnect events: an inactive query marked stale would otherwise
      // stay stale until a manual reload.
      queryClient.invalidateQueries({
        queryKey: ["job-offer", offerId],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["employer", "job-offers"],
        refetchType: "all",
      });
      toast({ description: "Embauche confirmée, offre clôturée." });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: errorMessage(error, "Échec de la confirmation."),
      });
    },
  });
}
