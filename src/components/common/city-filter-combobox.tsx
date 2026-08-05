import { useState } from "react";
import { CategoryCombobox } from "@/components/common/category-combobox";
import { useCities } from "@/hooks/use-geo";
import { useProfileMe } from "@/hooks/use-profile-me";
import { filterCities } from "@/lib/geo-fields";

/** Where to look when the viewer's profile has no country yet. */
const FALLBACK_COUNTRY = "CG";

type Props = {
  readonly value: string;
  readonly onChange: (city: string) => void;
  readonly allLabel?: string;
  readonly container?: HTMLElement | null;
};

/**
 * City picker for the search filters, scoped to the viewer's own country.
 *
 * Replaces a free-text box. Typing "Bacongo" only ever matched by substring
 * against the free-text address, so a typo or a neighbourhood name silently
 * returned nothing and looked like "no jobs here" rather than "no such city".
 * Picking from the real list means the value always matches what is stored.
 *
 * There is no country picker beside it on purpose: someone searching for work
 * is searching where they are, and a second control on an already-long filter
 * sheet buys nothing. `FALLBACK_COUNTRY` covers profiles created before the
 * country backfill — the same default that backfill writes.
 */
export function CityFilterCombobox({
  value,
  onChange,
  allLabel = "Toutes les villes",
  container,
}: Props) {
  const { data: profile } = useProfileMe();
  const countryCode = profile?.countryCode || FALLBACK_COUNTRY;

  const cities = useCities(countryCode);
  const [search, setSearch] = useState("");

  // Capped and filtered here: some countries have ~15 000 cities and handing
  // them all to the combobox renders 15 000 DOM nodes.
  const { options, truncated } = filterCities(cities.data, search);

  return (
    <CategoryCombobox
      options={options}
      value={value || null}
      onChange={(city) => onChange(city ?? "")}
      allLabel={allLabel}
      placeholder={allLabel}
      disabled={cities.isPending}
      container={container}
      search={search}
      onSearchChange={setSearch}
      footnote={
        truncated > 0 ? `${truncated} autres — précisez votre recherche` : undefined
      }
    />
  );
}
