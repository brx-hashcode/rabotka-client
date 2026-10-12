import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  updateJobOffer,
  type UpdateJobOfferPayload,
} from "@/lib/api/job-offer-controller";

/**
 * Edits one of the employer's own ACTIVE offers. The backend message (offer no
 * longer active, date too close, type locked…) surfaces via the error toast.
 * The caller handles navigation on success.
 */
export function useUpdateJobOffer(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (payload: UpdateJobOfferPayload) =>
      updateJobOffer(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-offer", id] });
      queryClient.invalidateQueries({
        queryKey: ["employer", "job-offers"],
        refetchType: "all",
      });
      toast({ description: "Offre modifiée." });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description:
          error instanceof Error && error.message
            ? error.message
            : "Échec de la modification de l'offre.",
      });
    },
  });
}
