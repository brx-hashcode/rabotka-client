// @vitest-environment node
import { describe, expect, it } from "vitest";
import { networkNames, topUpError } from "@/lib/top-up";

describe("networkNames", () => {
  it("names each network once, whatever the country or label", () => {
    expect(
      networkNames([
        { code: "MTN_MOMO_COG", label: "MTN" },
        { code: "AIRTEL_COG", label: "Airtel" },
        { code: "MTN_MOMO_CMR", label: "MTN Mobile Money" },
        { code: "ORANGE_SEN", label: "Orange" },
        { code: "AIRTEL_GAB", label: "Airtel Money" },
      ]),
    ).toEqual(["MTN", "Airtel", "Orange"]);
  });
});

describe("topUpError", () => {
  it("accepts an amount in range, and says nothing before one is typed", () => {
    expect(topUpError(5000, 500, 500_000)).toBeNull();
    expect(topUpError(null, 500, 500_000)).toBeNull();
  });

  it("says which bound was crossed", () => {
    expect(topUpError(100, 500, 500_000)).toMatch(/^Le minimum est de 500/);
    expect(topUpError(600_000, 500, 500_000)).toMatch(/^Le maximum est de 500/);
    expect(topUpError(1500.5, 500, 500_000)).toBe(
      "Saisissez un montant sans centimes.",
    );
  });
});
