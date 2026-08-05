// @vitest-environment node
// Pure derivation — and the only testable form these rules can take, since
// jsdom cannot start in this repo (its native `canvas` binding fails to load).
import { describe, expect, it } from "vitest";
import {
  MAX_CITY_OPTIONS,
  cityPlaceholder,
  countryCityLabels,
  filterCities,
  isCityDisabled,
  locationAfterCountryChange,
  toCityOptions,
  toCountryOptions,
} from "@/lib/geo-fields";

const COUNTRIES = [
  { code: "CG", name: "Congo-Brazzaville" },
  { code: "FR", name: "France" },
];

describe("toCountryOptions()", () => {
  /**
   * This shipped broken once. The API returns `{ code, name }` and the combobox
   * identifies options by `id`, so passing the rows through unmapped rendered
   * every country name and made none of them selectable. Asserting the visible
   * names would not have caught it — only the id does.
   */
  it("keys each option by its country code", () => {
    expect(toCountryOptions(COUNTRIES)).toEqual([
      { id: "CG", name: "Congo-Brazzaville" },
      { id: "FR", name: "France" },
    ]);
  });

  it("never yields an option without an id", () => {
    for (const o of toCountryOptions(COUNTRIES)) {
      expect(o.id).toBeTruthy();
    }
  });

  it("renders nothing rather than throwing before the list loads", () => {
    expect(toCountryOptions(undefined)).toEqual([]);
  });
});

describe("toCityOptions()", () => {
  it("uses the city name as its own identity", () => {
    expect(toCityOptions(["Brazzaville", "Dolisie"])).toEqual([
      { id: "Brazzaville", name: "Brazzaville" },
      { id: "Dolisie", name: "Dolisie" },
    ]);
  });

  it("tolerates an absent list", () => {
    expect(toCityOptions(undefined)).toEqual([]);
  });
});

describe("locationAfterCountryChange()", () => {
  it("resolves the display name from the code", () => {
    expect(locationAfterCountryChange("FR", COUNTRIES)).toEqual({
      countryCode: "FR",
      countryName: "France",
      city: "",
    });
  });

  it("always clears the city", () => {
    // The failure this prevents is invisible on screen: a city carried over
    // from the previous country is stored against a country it does not belong
    // to, and only surfaces later as a profile no city filter can match.
    expect(locationAfterCountryChange("FR", COUNTRIES).city).toBe("");
    expect(locationAfterCountryChange("CG", COUNTRIES).city).toBe("");
    // Including when the country itself is cleared — a city with no country is
    // just as unusable.
    expect(locationAfterCountryChange(null, COUNTRIES)).toEqual({
      countryCode: "",
      countryName: "",
      city: "",
    });
  });

  it("stores nothing for a code that is not in the list", () => {
    expect(locationAfterCountryChange("ZZ", COUNTRIES).countryCode).toBe("");
  });
});

describe("the city control", () => {
  it("is disabled until a country is chosen", () => {
    expect(isCityDisabled("", false)).toBe(true);
    expect(isCityDisabled(undefined, false)).toBe(true);
    expect(isCityDisabled("CG", false)).toBe(false);
  });

  it("is disabled while its list is still loading", () => {
    expect(isCityDisabled("CG", true)).toBe(true);
  });

  it("says why it is disabled instead of sitting empty", () => {
    expect(cityPlaceholder("", false)).toBe(
      countryCityLabels.city.placeholderNoCountry,
    );
    expect(cityPlaceholder("CG", true)).toBe(countryCityLabels.city.loading);
    expect(cityPlaceholder("CG", false)).toBe(
      countryCityLabels.city.placeholder,
    );
  });
});

describe("filterCities()", () => {
  const CG = ["Brazzaville", "Dolisie", "Owando", "Pointe-Noire", "Bétou"];

  it("caps the list so a huge country cannot lock up the browser", () => {
    // France and the United States each have ~15 000 cities in the dataset.
    // Handing them all to the combobox renders 15 000 DOM nodes.
    const many = Array.from({ length: 5000 }, (_, i) => `Ville ${i}`);
    const { options, truncated } = filterCities(many, "");

    expect(options).toHaveLength(MAX_CITY_OPTIONS);
    expect(truncated).toBe(5000 - MAX_CITY_OPTIONS);
  });

  it("reports nothing truncated when everything fits", () => {
    expect(filterCities(CG, "").truncated).toBe(0);
  });

  it("puts prefix matches ahead of mere substring matches", () => {
    // Typing "bra" must surface Brazzaville, not whatever alphabetically
    // earlier city happens to contain those letters.
    const cities = ["Zimbrazo", "Brazzaville"];
    expect(filterCities(cities, "bra").options[0].name).toBe("Brazzaville");
  });

  it("ignores accents in both directions", () => {
    // Otherwise someone typing "betou" on a phone keyboard is told their own
    // town does not exist.
    expect(filterCities(CG, "betou").options[0]?.name).toBe("Bétou");
    expect(filterCities(["Bethune"], "béthune").options[0]?.name).toBe(
      "Bethune",
    );
  });

  it("ignores case and surrounding whitespace", () => {
    expect(filterCities(CG, "  POINTE ").options[0]?.name).toBe("Pointe-Noire");
  });

  it("returns nothing for a city that is not there", () => {
    expect(filterCities(CG, "Lyon").options).toEqual([]);
    expect(filterCities(CG, "Lyon").truncated).toBe(0);
  });

  it("tolerates an absent list", () => {
    expect(filterCities(undefined, "bra").options).toEqual([]);
  });
});
