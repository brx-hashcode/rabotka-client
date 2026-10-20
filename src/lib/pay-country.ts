import {
  getCountries,
  getCountryCallingCode,
  type Country,
} from "react-phone-number-input";
import type {
  PaymentGatewayInfo,
  PaymentOperator,
} from "@/lib/api/payment-controller";

/**
 * A country the checkout can charge in, as the gateway describes it. Nothing
 * here is a list kept in code: names, flags, calling codes and currencies all
 * come from the gateway's live configuration (pawaPay's active-conf), so a
 * country enabled on the account shows up without a release.
 */
export type PayCountry = {
  /** Gateway code, ISO alpha-3 (`COG`). */
  code: string;
  name: string;
  flag?: string;
  dialCode?: string;
  currency?: string;
  /** For the phone field: the ISO alpha-2 country with that calling code. */
  alpha2?: Country;
};

/** The phone library's country for a calling code (`242` → `CG`). */
export function alpha2ForDialCode(dial: string | undefined): Country | undefined {
  if (!dial) return undefined;
  return getCountries().find((c) => getCountryCallingCode(c) === dial);
}

/** The calling code of an ISO alpha-2 country, or undefined if unknown. */
export function dialCodeOf(alpha2: string | null | undefined): string | undefined {
  if (!alpha2) return undefined;
  const upper = alpha2.toUpperCase() as Country;
  return getCountries().includes(upper) ? getCountryCallingCode(upper) : undefined;
}

/** Each country the gateway has networks in, once, in the gateway's order. */
export function payCountries(gateway: PaymentGatewayInfo | null): PayCountry[] {
  const out: PayCountry[] = [];
  for (const o of gateway?.operators ?? []) {
    if (!o.country || out.some((c) => c.code === o.country)) continue;
    const alpha2 = alpha2ForDialCode(o.dialCode);
    out.push({
      code: o.country,
      // A name from the gateway, else the browser's, never the bare « CMR ».
      name: o.countryName ?? (alpha2 && regionName(alpha2)) ?? o.country,
      flag: o.countryFlag,
      dialCode: o.dialCode,
      currency: o.currency,
      alpha2,
    });
  }
  return out;
}

/**
 * Where the checkout opens: the country whose calling code is the payer's
 * own country's, else the first one the gateway covers — never an empty list.
 */
export function initialPayCountry(
  payerCountryCode: string | null | undefined,
  covered: readonly PayCountry[],
): PayCountry | null {
  const dial = dialCodeOf(payerCountryCode);
  return covered.find((c) => dial && c.dialCode === dial) ?? covered[0] ?? null;
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

/** A country's name in French, from the browser (`RW` → « Rwanda »). */
export function regionName(alpha2: string): string | null {
  try {
    return (
      new Intl.DisplayNames(["fr"], { type: "region" }).of(alpha2.toUpperCase()) ??
      null
    );
  } catch {
    return null;
  }
}
