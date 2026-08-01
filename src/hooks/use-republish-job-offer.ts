import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { republish } from "@/lib/api/job-offer-controller";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

/**
 * Reopens an EXPIRED offer at a new date.
 *
 * This used to be possible only by replying to the WhatsApp expiry message, so
 * an employer who missed it had no way to reopen the offer at all. The backend
 * re-checks ownership, EXPIRED status and the 4-hour minimum lead time, and its
 * message surfaces through the error toast.
 */
export function useRepublishJobOffer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, scheduledAt }: { id: string; scheduledAt: string }) =>
      republish(id, scheduledAt),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["employer", "job-offers"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({ queryKey: ["job-offer", id] });
      toast({ description: "Offre republiée." });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: errorMessage(error, "Échec de la republication."),
      });
    },
  });
}
