import { useQuery } from "@tanstack/react-query";
import { getByToken } from "@/lib/api/payment-controller";

export function usePaymentByToken(token: string | undefined) {
  return useQuery({
    queryKey: ["payment", token],
    queryFn: () => getByToken(token!),
    enabled: !!token,
    retry: false,
  });
}
