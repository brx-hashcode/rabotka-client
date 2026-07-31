import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  cancelWorkerMission,
  getCancellationPreview,
} from "@/lib/api/worker-mission-controller";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

/**
 * Whether cancelling this application right now would cost a penalty.
 *
 * Fetched only while the confirm dialog is open (`enabled`), so opening a
 * mission page does not fire an extra request. Cancelling close to the start
 * time costs money and reliability score, so the dialog must state that before
 * the worker commits.
 */
export function useCancellationPreview(id: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["worker-mission", id, "cancellation-preview"],
    queryFn: () => getCancellationPreview(id!),
    enabled: Boolean(id) && enabled,
    staleTime: 0,
  });
}

/**
 * Withdraws the worker's own application or mission.
 *
 * This was previously only possible over WhatsApp, so a worker who applied on
 * the web had no way to withdraw at all.
 */
export function useCancelWorkerMission() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelWorkerMission(id, reason ? { reason } : undefined),
    onSuccess: (result, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["worker-missions"] });
      queryClient.invalidateQueries({ queryKey: ["worker-mission", id] });
      // The penalty is charged server-side, so the wallet/penalties views are
      // stale too.
      queryClient.invalidateQueries({ queryKey: ["penalties"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });

      toast({
        description: result.penaltyApplied
          ? `Candidature annulée. Une pénalité de ${result.penaltyAmount?.toLocaleString("fr-FR")} FCFA a été appliquée.`
          : "Candidature annulée.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: errorMessage(error, "Échec de l'annulation."),
      });
    },
  });
}
