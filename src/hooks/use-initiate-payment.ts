import { useMutation } from "@tanstack/react-query";
import {
  initiatePayment,
  type InitiatePaymentPayload,
} from "@/lib/api/payment-controller";
import { useToast } from "@/hooks/use-toast";

export function useInitiatePayment(token: string) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: InitiatePaymentPayload) => initiatePayment(token, data),
    onError: (error) => {
      // The gateway's reason when there is one ("Numéro de téléphone
      // invalide", "Opérateur momentanément indisponible"…): the payer can act
      // on it, which a generic failure does not let them do.
      toast({
        variant: "destructive",
        description:
          error instanceof Error && error.message
            ? error.message
            : "Échec de l'initiation du paiement.",
      });
    },
  });
}
