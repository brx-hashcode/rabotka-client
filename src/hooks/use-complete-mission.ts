import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { completeMission } from "@/lib/api/application-controller";

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
 * Employer marks a mission completed and rates the worker. Refreshes the offer
 * detail (status/workers) and the offers lists.
 */
export function useCompleteMission() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ applicationId, score, note }: Vars) =>
      completeMission(applicationId, { score, note }),
    onSuccess: (_data, { offerId }) => {
      queryClient.invalidateQueries({ queryKey: ["job-offer", offerId] });
      queryClient.invalidateQueries({
        queryKey: ["employer", "job-offers"],
        refetchType: "all",
      });
      toast({ description: "Mission terminée et travailleur noté." });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: errorMessage(error, "Échec de la clôture de la mission."),
      });
    },
  });
}
