import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  getWorkerUnlock,
  payWorkerUnlockMobile,
  payWorkerUnlockWallet,
} from "@/lib/api/worker-mission-controller";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

/** The worker's own side of a contact unlock (fee, wallet balance, who paid). */
export function useWorkerUnlock(id: string | undefined) {
  return useQuery({
    queryKey: ["worker-mission", id, "unlock"],
    queryFn: () => getWorkerUnlock(id!),
    enabled: Boolean(id),
  });
}

/**
 * Pays the worker's share from wallet credit.
 *
 * Contacts reach both parties on WhatsApp only once BOTH have paid, so a
 * successful call here does not necessarily mean the contact was released.
 */
export function usePayWorkerUnlockWallet(id: string) {
  const { toast } = useToast();
  return useMutation({
    mutationFn: () => payWorkerUnlockWallet(id),
    // No explicit invalidation: the MutationCache in app/providers invalidates
    // the whole cache after every successful mutation. The keys listed here
    // previously ("worker-missions", "wallet") matched no query anyway — the
    // real ones are ["worker","missions",…] and ["profile","wallet","balance"].
    onError: (error) => {
      toast({
        variant: "destructive",
        description: errorMessage(error, "Échec du paiement."),
      });
    },
  });
}

/** Creates a mobile-money payment request and returns its /pay/:token. */
export function usePayWorkerUnlockMobile(id: string) {
  const { toast } = useToast();
  return useMutation({
    mutationFn: () => payWorkerUnlockMobile(id),
    onError: (error) => {
      toast({
        variant: "destructive",
        description: errorMessage(error, "Échec de l'initiation du paiement."),
      });
    },
  });
}
