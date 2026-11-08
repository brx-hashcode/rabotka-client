import { useQuery } from "@tanstack/react-query";

import { getCurrency } from "@/lib/api/payment-controller";
import { formatMoney, formatPrice, XAF, type DisplayCurrency } from "@/lib/money";
import { useProfileMe } from "./use-profile-me";

/**
 * The currency the signed-in profile sees Rabotka's prices in: its country's
 * (dollars in the DRC), FCFA in the CFA zone or while unknown. Converted and
 * rounded as checkout charges (lib/money.ts).
 */
export function useDisplayCurrency(): {
  currency: DisplayCurrency;
  /** An XAF price, said in that currency. */
  price: (xaf: number) => string;
} {
  const me = useProfileMe();
  const country = me.data?.countryCode ?? null;
  const rate = useQuery({
    queryKey: ["payment-currency", country],
    queryFn: () => getCurrency(country as string),
    enabled: !!country,
    staleTime: 30 * 60 * 1000,
  });
  const currency = rate.data ?? XAF;
  return { currency, price: (xaf) => formatPrice(xaf, currency) };
}

export { formatMoney };
