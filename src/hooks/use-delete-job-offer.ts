import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { deleteJobOffer } from "@/lib/api/job-offer-controller";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

/**
 * Soft-deletes one of the employer's own job offers. Only succeeds server-side
 * while the offer is ACTIVE with no candidates; the backend message surfaces via
 * the error toast otherwise. The caller handles navigation on success.
 */
export function useDeleteJobOffer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => deleteJobOffer(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: ["employer", "job-offers"],
        refetchType: "all",
      });
      queryClient.removeQueries({ queryKey: ["job-offer", id] });
      toast({ description: "Offre supprimée." });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: errorMessage(error, "Échec de la suppression."),
      });
    },
  });
}
