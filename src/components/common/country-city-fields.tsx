import { useState } from "react";
import { useCities, useCountries } from "@/hooks/use-geo";
import { CategoryCombobox } from "@/components/common/category-combobox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  cityPlaceholder,
  countryCityLabels,
  filterCities,
  isCityDisabled,
  locationAfterCountryChange,
  toCountryOptions,
} from "@/lib/geo-fields";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

/**
 * The shape any form using these fields must have. Written as a constraint
 * rather than a concrete type so the same component serves onboarding
 * (`Step1FormData`) and the profile edit sheet.
 */
export type CountryCityFields = {
  countryCode: string;
  countryName: string;
  city: string;
};

type Props<T extends FieldValues> = {
  readonly form: UseFormReturn<T>;
  /** Portal target, when rendered inside a Sheet/Dialog. */
  readonly container?: HTMLElement | null;
};

/**
 * Paired country and city pickers.
 *
 * The city list depends on the country, so the city control stays disabled
 * until a country is chosen and is cleared whenever the country changes. The
 * rules and the option mapping live in `@/lib/geo-fields` because jsdom cannot
 * start in this repo (broken `canvas` binding), so pure functions are the only
 * part of this that can actually be tested.
 *
 * `countryName` is carried in the form alongside the code purely so the confirm
 * screen can show a name without a second lookup; the server re-derives it from
 * the code, so the two cannot disagree in the database.
 */
export function CountryCityFields<T extends FieldValues>({
  form,
  container,
}: Props<T>) {
  const countryField = "countryCode" as Path<T>;
  const cityField = "city" as Path<T>;

  const countryCode = form.watch(countryField) as string | undefined;
  const countries = useCountries();
  const cities = useCities(countryCode);

  // The city list is filtered here rather than by the combobox: a country can
  // have 15 000 cities, and rendering them all would lock up the phone.
  const [citySearch, setCitySearch] = useState("");
  const { options: cityOptions, truncated } = filterCities(
    cities.data,
    citySearch,
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name={countryField}
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>{countryCityLabels.country.label}</FormLabel>
            <FormControl>
              <CategoryCombobox
                options={toCountryOptions(countries.data)}
                value={field.value || null}
                onChange={(code) => {
                  const next = locationAfterCountryChange(
                    code,
                    countries.data,
                  );
                  field.onChange(next.countryCode);
                  form.setValue(
                    "countryName" as Path<T>,
                    next.countryName as never,
                    { shouldValidate: true },
                  );
                  form.setValue(cityField, next.city as never, {
                    shouldValidate: true,
                  });
                  setCitySearch("");
                }}
                placeholder={countryCityLabels.country.placeholder}
                disabled={countries.isPending}
                container={container}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={cityField}
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>{countryCityLabels.city.label}</FormLabel>
            <FormControl>
              <CategoryCombobox
                options={cityOptions}
                value={field.value || null}
                onChange={(city) => field.onChange(city ?? "")}
                placeholder={cityPlaceholder(countryCode, cities.isPending)}
                disabled={isCityDisabled(countryCode, cities.isPending)}
                container={container}
                search={citySearch}
                onSearchChange={setCitySearch}
                footnote={
                  truncated > 0
                    ? `${truncated} autres — précisez votre recherche`
                    : undefined
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
