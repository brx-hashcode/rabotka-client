import { useMutation } from "@tanstack/react-query";
import { initiatePayment } from "@/lib/api/payment-controller";
import { useToast } from "@/hooks/use-toast";

export function useInitiatePayment(token: string) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: { phone: string; operator: "CG_MTNMOBILEMONEY" | "CG_AIRTELMONEY" }) =>
      initiatePayment(token, data),
    onError: () => {
      toast({ variant: "destructive", description: "Échec de l'initiation du paiement." });
    },
  });
}
