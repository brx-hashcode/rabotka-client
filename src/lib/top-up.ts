import type { PaymentOperator } from "@/lib/api/payment-controller";
import { formatAmount } from "@/lib/utils";

/**
 * The networks a payer can use, named once each — « MTN, Airtel, Orange ».
 *
 * From the live gateway rather than a sentence in code: the page used to say
 * « (MTN / Airtel) » while Orange, Moov and Free were live too. Labels like
 * « MTN Mobile Money » and « MTN » (two countries) are the same network.
 */
export function networkNames(operators: readonly PaymentOperator[]): string[] {
  const names: string[] = [];
  for (const o of operators) {
    const name = o.label.split(/\s+/)[0];
    if (name && !names.includes(name)) names.push(name);
  }
  return names;
}

/** Why an amount cannot be topped up, or null when it can. */
export function topUpError(
  amount: number | null,
  min: number,
  max: number,
): string | null {
  if (amount == null) return null;
  if (!Number.isInteger(amount)) return "Saisissez un montant sans centimes.";
  if (amount < min) return `Le minimum est de ${formatAmount(min)}.`;
  if (amount > max) return `Le maximum est de ${formatAmount(max)}.`;
  return null;
}
