/**
 * Case- and accent-insensitive text matching.
 *
 * The domain names are French and full of diacritics — "Maraîchage",
 * "Secrétariat", "Revêtement", "Maçonnerie" — and nobody reaches for the
 * accented key while typing into a picker on a phone. Raw comparison makes
 * those options unreachable by the spelling every user actually types.
 */

/**
 * Lower-cased and stripped of diacritics, so "Maraichage" matches "Maraîchage".
 *
 * NFD splits an accented character into its base letter plus a combining mark,
 * which `\p{Diacritic}` then removes — so this covers every accent in the data
 * rather than a hand-written é/è/à table that the next language would outgrow.
 */
export function fold(value: string): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/**
 * Whether every word of the query appears somewhere in the haystack.
 *
 * Per-word rather than one substring, so word order and the filler between
 * words stop mattering: "vente viande" finds "Boucherie & Vente de viande".
 * That is what someone types when they half-remember a domain, and it misses
 * under a plain `includes`.
 *
 * AND, not OR — every word has to land, or a two-word query returns most of
 * the list and the filter stops being one.
 */
export function matchesSearch(
  query: string,
  ...haystack: (string | null | undefined)[]
): boolean {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;

  const target = fold(haystack.filter(Boolean).join(" "));
  return words.every((word) => target.includes(word));
}

/**
 * cmdk's `filter` prop, made accent-insensitive.
 *
 * cmdk scores with `command-score`, which is fuzzy but compares raw code
 * points: `é` and `e` are simply different characters to it, so
 * "Maraîchage" scored 0 against "maraichage" and the option vanished from the
 * list. Folding both sides before matching is the whole fix.
 *
 * Returns 1/0 rather than a graded score. cmdk sorts by score, and a graded
 * one would reorder the domain list on every keystroke; these lists are short
 * and already alphabetical, which is easier to scan than a ranking that moves.
 */
export function foldedCommandFilter(
  value: string,
  search: string,
  keywords?: string[],
): number {
  return matchesSearch(search, value, ...(keywords ?? [])) ? 1 : 0;
}
