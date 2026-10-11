import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  deleteJobOffer,
  type JobOfferWorkerItem,
} from "@/lib/api/job-offer-controller";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

/**
 * Soft-deletes one of the employer's own job offers. Only succeeds server-side
 * while nobody is engaged on it; the backend message surfaces via the error
 * toast otherwise. The caller handles navigation on success.
 *
 * The offer's applications go with it server-side, so everything cached about
 * the offer and them is dropped — never refetched, which would only 404 — and
 * the lists that showed them are refetched.
 */
export function useDeleteJobOffer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => deleteJobOffer(id),
    meta: { skipGlobalInvalidation: true },
    onSuccess: (_data, id) => {
      const applications = queryClient.getQueryData<JobOfferWorkerItem[]>([
        "job-offer",
        id,
        "applications",
      ]);
      // The offer, its applications list (same prefix), and each application.
      queryClient.removeQueries({ queryKey: ["job-offer", id] });
      for (const a of applications ?? []) {
        queryClient.removeQueries({ queryKey: ["application", a.applicationId] });
      }
      queryClient.invalidateQueries({
        queryKey: ["employer", "job-offers"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["employer", "applications"],
        refetchType: "all",
      });
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
