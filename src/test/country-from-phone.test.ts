// @vitest-environment node
import { describe, expect, it } from "vitest";
import { countryFromPhone } from "@/lib/geo-fields";

describe("countryFromPhone()", () => {
  it("names the country of a number from one of the 13", () => {
    expect(countryFromPhone("+242069917610")).toEqual({
      code: "CG",
      name: "Congo-Brazzaville",
    });
    expect(countryFromPhone("+243812345678")?.code).toBe("CD");
    expect(countryFromPhone("+221771234567")?.code).toBe("SN");
  });

  it("stays out of the way otherwise", () => {
    expect(countryFromPhone("+33612345678")).toBeNull(); // France: not offered
    expect(countryFromPhone("+242")).toBeNull(); // still typing
    expect(countryFromPhone("")).toBeNull();
    expect(countryFromPhone(undefined)).toBeNull();
    expect(countryFromPhone("not a number")).toBeNull();
  });
});
