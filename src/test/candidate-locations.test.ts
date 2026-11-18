// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  CANDIDATE_LOCATIONS,
  curatedCities,
  pickerCountries,
  withCurrentCity,
} from "@/lib/geo-fields";

describe("the candidate's location lists", () => {
  it("offers the 13 business countries, a capital and up to two cities each", () => {
    expect(CANDIDATE_LOCATIONS.map((c) => c.code).sort()).toEqual(
      ["BJ", "CD", "CG", "CI", "CM", "GA", "KE", "MZ", "RW", "SL", "SN", "UG", "ZM"],
    );
    for (const c of CANDIDATE_LOCATIONS) {
      expect(c.cities.length).toBeGreaterThanOrEqual(2);
      expect(c.cities.length).toBeLessThanOrEqual(3);
    }
    expect(curatedCities("CG")).toEqual(["Brazzaville", "Pointe-Noire"]);
  });

  it("leaves a country outside the 13 to the API", () => {
    expect(curatedCities("TD")).toBeNull();
    expect(curatedCities(undefined)).toBeNull();
  });

  it("keeps a stored country or city the list no longer offers", () => {
    expect(pickerCountries({ code: "TD", name: "Tchad" }).at(-1)).toEqual({
      code: "TD",
      name: "Tchad",
    });
    expect(pickerCountries({ code: "CG", name: "Congo-Brazzaville" })).toHaveLength(13);
    expect(pickerCountries(null)).toHaveLength(13);
    expect(withCurrentCity(["Brazzaville", "Pointe-Noire"], "Dolisie")).toEqual([
      "Brazzaville",
      "Pointe-Noire",
      "Dolisie",
    ]);
    expect(withCurrentCity(["Brazzaville"], "Brazzaville")).toEqual(["Brazzaville"]);
    expect(withCurrentCity(["Brazzaville"], "")).toEqual(["Brazzaville"]);
  });
});
