import type { Country } from "react-phone-number-input";
import type {
  PaymentGatewayInfo,
  PaymentOperator,
} from "@/lib/api/payment-controller";

/**
 * The countries a mobile-money gateway may cover, keyed by the alpha-3 code
 * the backend and pawaPay speak; alpha-2 drives the phone field's flag.
 * Mirrors ALPHA3 in the backend's payment-countries.ts.
 */
export const PAY_COUNTRIES: Record<
  string,
  { alpha2: Country; name: string; placeholder?: string }
> = {
  COG: { alpha2: "CG", name: "Congo", placeholder: "06 000 0000" },
  CMR: { alpha2: "CM", name: "Cameroun", placeholder: "6 00 00 00 00" },
  COD: { alpha2: "CD", name: "RD Congo" },
  GAB: { alpha2: "GA", name: "Gabon" },
  CIV: { alpha2: "CI", name: "Côte d'Ivoire" },
  SEN: { alpha2: "SN", name: "Sénégal" },
  BEN: { alpha2: "BJ", name: "Bénin" },
  BFA: { alpha2: "BF", name: "Burkina Faso" },
  GHA: { alpha2: "GH", name: "Ghana" },
  KEN: { alpha2: "KE", name: "Kenya" },
  MWI: { alpha2: "MW", name: "Malawi" },
  MOZ: { alpha2: "MZ", name: "Mozambique" },
  NGA: { alpha2: "NG", name: "Nigeria" },
  RWA: { alpha2: "RW", name: "Rwanda" },
  SLE: { alpha2: "SL", name: "Sierra Leone" },
  TZA: { alpha2: "TZ", name: "Tanzanie" },
  UGA: { alpha2: "UG", name: "Ouganda" },
  ZMB: { alpha2: "ZM", name: "Zambie" },
};

export function alpha3Of(alpha2: string | undefined): string | null {
  if (!alpha2) return null;
  return (
    Object.entries(PAY_COUNTRIES).find(([, c]) => c.alpha2 === alpha2)?.[0] ??
    null
  );
}

/** The countries the gateway has networks in, in the order it lists them. */
export function payCountries(gateway: PaymentGatewayInfo | null): string[] {
  const seen: string[] = [];
  for (const o of gateway?.operators ?? []) {
    if (o.country && PAY_COUNTRIES[o.country] && !seen.includes(o.country))
      seen.push(o.country);
  }
  return seen;
}

/**
 * Where the checkout opens: the payer's own country when the gateway covers
 * it, else the first one it does — never an empty operator list.
 */
export function initialPayCountry(
  payerCountry: string | null,
  covered: readonly string[],
): string | null {
  if (payerCountry && covered.includes(payerCountry)) return payerCountry;
  return covered[0] ?? null;
}

/**
 * The networks offered for a country. A gateway that does not say where its
 * networks operate (MTN MoMo direct) gets its whole list.
 */
export function operatorsIn(
  gateway: PaymentGatewayInfo | null,
  country: string | null,
): PaymentOperator[] {
  const all = gateway?.operators ?? [];
  if (!country || all.every((o) => !o.country)) return all;
  return all.filter((o) => o.country === country);
}
