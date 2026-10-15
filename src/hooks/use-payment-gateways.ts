import { useQuery } from "@tanstack/react-query";
import { getGateways } from "@/lib/api/payment-controller";

/** The payment gateways, and which one is live. Changes only on a deploy. */
export function usePaymentGateways() {
  return useQuery({
    queryKey: ["payment-gateways"],
    queryFn: () => getGateways(),
    staleTime: 10 * 60 * 1000,
  });
}
