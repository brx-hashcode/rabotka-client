import { useMutation } from "@tanstack/react-query";
import { initiatePayment } from "@/lib/api/payment-controller";

export function useInitiatePayment(token: string) {
  return useMutation({
    mutationFn: (data: { phone: string; operator: "CG_MTNMOBILEMONEY" | "CG_AIRTELMONEY" }) =>
      initiatePayment(token, data),
  });
}
