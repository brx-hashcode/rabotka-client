import type { ComboboxOption } from "@/components/common/category-combobox";
import type { Country } from "@/lib/api/geo-controller";

export const countryCityLabels = {
  country: { label: "Pays", placeholder: "Choisir un pays" },
  city: {
    label: "Ville",
    placeholder: "Choisir une ville",
    // The disabled state has to explain itself, or an empty greyed-out control
    // just reads as broken.
    placeholderNoCountry: "Choisissez d'abord un pays",
    loading: "Chargement…",
  },
} as const;

/** The location a form holds while being filled in. */
export type LocationValue = {
  countryCode: string;
  countryName: string;
  city: string;
};

/**
 * Countries as the combobox wants them.
 *
 * This mapping is the whole reason this module exists. The API returns
 * `{ code, name }` and `CategoryCombobox` identifies an option by `id`, so
 * passing the API rows straight through renders every country name correctly
 * and makes not one of them selectable — the click handler compares and emits
 * `undefined`. It looks like a broken popover, not a data shape mistake.
 */
export function toCountryOptions(
  countries: readonly Country[] | undefined,
): ComboboxOption[] {
  return (countries ?? []).map((c) => ({ id: c.code, name: c.name }));
}

/** Cities are plain strings; the name is the identity. */
export function toCityOptions(
  cities: readonly string[] | undefined,
): ComboboxOption[] {
  return (cities ?? []).map((name) => ({ id: name, name }));
}

/**
 * How many cities may reach the DOM at once.
 *
 * The dataset covers every place above 500 inhabitants worldwide, which is
 * ~15 000 cities for France or the United States. Handing that many items to
 * the combobox renders 15 000 nodes and locks up a phone, so the list is always
 * capped and search is what reaches the rest.
 */
export const MAX_CITY_OPTIONS = 50;

/**
 * The cities to show for a search box's current contents.
 *
 * Accent-insensitive, because the alternative is that someone typing "bethune"
 * is told their own town does not exist. Prefix matches come first — typing
 * "bra" should surface Brazzaville, not the first alphabetical city that merely
 * contains "bra".
 */
export function filterCities(
  cities: readonly string[] | undefined,
  query: string,
  limit = MAX_CITY_OPTIONS,
): { options: ComboboxOption[]; truncated: number } {
  const all = cities ?? [];
  const q = fold(query);

  const matches = q ? rankMatches(all, q, limit) : all.slice(0, limit);

  return {
    options: matches.map((name) => ({ id: name, name })),
    truncated: Math.max(0, (q ? countMatches(all, q) : all.length) - limit),
  };
}

/** Lower-cased and stripped of diacritics, so "Béthune" matches "bethune". */
function fold(value: string): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function countMatches(all: readonly string[], q: string): number {
  let n = 0;
  for (const name of all) if (fold(name).includes(q)) n++;
  return n;
}

/** Prefix hits, then the rest, stopping as soon as `limit` is reached. */
function rankMatches(
  all: readonly string[],
  q: string,
  limit: number,
): string[] {
  const prefix: string[] = [];
  const contains: string[] = [];

  for (const name of all) {
    const folded = fold(name);
    if (folded.startsWith(q)) {
      prefix.push(name);
      if (prefix.length >= limit) return prefix;
    } else if (folded.includes(q) && contains.length < limit) {
      contains.push(name);
    }
  }

  return [...prefix, ...contains].slice(0, limit);
}

/**
 * The location after the country picker changes.
 *
 * ALWAYS clears the city — including when the country is cleared. A city held
 * over from the previous country is the failure that matters here: it is
 * invisible on screen, it is stored against a country it does not belong to,
 * and it surfaces much later as a profile that no city filter can match.
 */
export function locationAfterCountryChange(
  code: string | null,
  countries: readonly Country[] | undefined,
): LocationValue {
  const country = (countries ?? []).find((c) => c.code === code);
  return {
    countryCode: country?.code ?? "",
    countryName: country?.name ?? "",
    city: "",
  };
}

/** The city picker is unusable until a country narrows the list. */
export function isCityDisabled(
  countryCode: string | null | undefined,
  citiesPending: boolean,
): boolean {
  return !countryCode || citiesPending;
}

export function cityPlaceholder(
  countryCode: string | null | undefined,
  citiesPending: boolean,
): string {
  if (!countryCode) return countryCityLabels.city.placeholderNoCountry;
  if (citiesPending) return countryCityLabels.city.loading;
  return countryCityLabels.city.placeholder;
}
