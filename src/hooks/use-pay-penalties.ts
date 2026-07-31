import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  getPenaltiesDue,
  payPenaltiesWithWallet,
  payPenaltiesWithMobile,
} from "@/lib/api/profile-controller";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

/** Amount owed + wallet balance, for the payment-method chooser. */
export function usePenaltiesDue() {
  return useQuery({
    queryKey: ["profile", "penalties", "due"],
    queryFn: getPenaltiesDue,
  });
}

/** Settle all unpaid penalties from the wallet balance. */
export function usePayPenaltiesWallet() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: () => payPenaltiesWithWallet(),
    onError: (error) => {
      toast({
        variant: "destructive",
        description: errorMessage(error, "Échec du paiement par portefeuille."),
      });
    },
  });
}

/** Start a Mobile Money payment; the token drives the shared /pay/:token screen. */
export function usePayPenaltiesMobile() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: () => payPenaltiesWithMobile(),
    onError: (error) => {
      toast({
        variant: "destructive",
        description: errorMessage(
          error,
          "Impossible de démarrer le paiement mobile money.",
        ),
      });
    },
  });
}
