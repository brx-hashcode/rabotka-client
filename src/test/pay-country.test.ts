// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { PaymentGatewayInfo } from "@/lib/api/payment-controller";
import {
  alpha3Of,
  initialPayCountry,
  operatorsIn,
  payCountries,
} from "@/lib/pay-country";

const pawaPay = {
  key: "PAWAPAY",
  label: "pawaPay",
  requiresOperator: true,
  operators: [
    { code: "MTN_MOMO_COG", label: "MTN Mobile Money", country: "COG" },
    { code: "AIRTEL_COG", label: "Airtel Money", country: "COG" },
    { code: "MTN_MOMO_CMR", label: "MTN Mobile Money", country: "CMR" },
    { code: "ORANGE_CMR", label: "Orange Money", country: "CMR" },
  ],
} as unknown as PaymentGatewayInfo;

describe("pay country", () => {
  it("lists each covered country once, in the gateway's order", () => {
    expect(payCountries(pawaPay)).toEqual(["COG", "CMR"]);
  });

  it("opens on the payer's country when it is covered", () => {
    expect(initialPayCountry("CMR", ["COG", "CMR"])).toBe("CMR");
  });

  it("opens on a covered country rather than an empty list", () => {
    expect(initialPayCountry("GAB", ["COG", "CMR"])).toBe("COG");
    expect(initialPayCountry(null, ["COG", "CMR"])).toBe("COG");
  });

  it("offers only the chosen country's networks", () => {
    expect(operatorsIn(pawaPay, "CMR").map((o) => o.code)).toEqual([
      "MTN_MOMO_CMR",
      "ORANGE_CMR",
    ]);
  });

  it("offers every network of a gateway that names no country", () => {
    const momo = {
      ...pawaPay,
      operators: [{ code: "MTN", label: "MTN" }],
    } as unknown as PaymentGatewayInfo;
    expect(operatorsIn(momo, "COG")).toHaveLength(1);
  });

  it("maps the phone field's flag back to the gateway's code", () => {
    expect(alpha3Of("CM")).toBe("CMR");
    expect(alpha3Of("FR")).toBeNull();
  });
});
