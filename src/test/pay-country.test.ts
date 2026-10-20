// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { PaymentGatewayInfo } from "@/lib/api/payment-controller";
import {
  alpha2ForDialCode,
  dialCodeOf,
  initialPayCountry,
  operatorsIn,
  payCountries,
} from "@/lib/pay-country";

/** What the backend sends from pawaPay's live configuration. */
const pawaPay = {
  key: "PAWAPAY",
  label: "pawaPay",
  requiresOperator: true,
  operators: [
    { code: "MTN_MOMO_CMR", label: "MTN", country: "CMR", countryName: "Cameroun", dialCode: "237", currency: "XAF", countryFlag: "cmr.svg" },
    { code: "AIRTEL_COG", label: "Airtel", country: "COG", countryName: "Congo", dialCode: "242", currency: "XAF" },
    { code: "MTN_MOMO_COG", label: "MTN", country: "COG", countryName: "Congo", dialCode: "242", currency: "XAF" },
    { code: "ORANGE_SEN", label: "Orange", country: "SEN", countryName: "Sénégal", dialCode: "221", currency: "XOF" },
  ],
} as unknown as PaymentGatewayInfo;

describe("pay country", () => {
  it("builds each country once from the live operators, currency included", () => {
    const countries = payCountries(pawaPay);
    expect(countries.map((c) => [c.code, c.name, c.currency, c.alpha2])).toEqual([
      ["CMR", "Cameroun", "XAF", "CM"],
      ["COG", "Congo", "XAF", "CG"],
      ["SEN", "Sénégal", "XOF", "SN"],
    ]);
    expect(countries[0].flag).toBe("cmr.svg");
  });

  it("opens on the payer's country, found by calling code", () => {
    const countries = payCountries(pawaPay);
    expect(initialPayCountry("SN", countries)?.code).toBe("SEN");
    expect(initialPayCountry("cg", countries)?.code).toBe("COG");
  });

  it("opens on a covered country when the payer's is not one", () => {
    const countries = payCountries(pawaPay);
    expect(initialPayCountry("RW", countries)?.code).toBe("CMR");
    expect(initialPayCountry(null, countries)?.code).toBe("CMR");
  });

  it("offers only the chosen country's networks", () => {
    expect(operatorsIn(pawaPay, "COG").map((o) => o.code)).toEqual([
      "AIRTEL_COG",
      "MTN_MOMO_COG",
    ]);
  });

  it("offers every network of a gateway that names no country", () => {
    const momo = { ...pawaPay, operators: [{ code: "MTN", label: "MTN" }] } as unknown as PaymentGatewayInfo;
    expect(operatorsIn(momo, "COG")).toHaveLength(1);
  });

  it("maps between calling codes and the phone field's countries", () => {
    expect(alpha2ForDialCode("229")).toBe("BJ");
    expect(dialCodeOf("RW")).toBe("250");
    expect(dialCodeOf("XX")).toBeUndefined();
  });
});
