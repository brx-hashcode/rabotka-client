import { useState } from "react";
import { useCities } from "@/hooks/use-geo";
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
  curatedCities,
  filterCities,
  isCityDisabled,
  locationAfterCountryChange,
  pickerCountries,
  toCityOptions,
  toCountryOptions,
  withCurrentCity,
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
  /**
   * A line under the country picker saying what this country is *for*.
   *
   * Caller-supplied rather than baked in, because the answer differs: on a
   * profile it is where the person is, on a job offer it is where the work is.
   * A single wording here would be wrong in one of those places.
   */
  readonly countryHint?: string;
  /**
   * The country is already set by the caller (a job offer is posted in the
   * employer's own country): show the city alone, its list read from the
   * country the form holds.
   */
  readonly hideCountry?: boolean;
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
  countryHint,
  hideCountry = false,
}: Props<T>) {
  const countryField = "countryCode" as Path<T>;
  const cityField = "city" as Path<T>;

  const countryCode = form.watch(countryField) as string | undefined;
  const countryName = form.watch("countryName" as Path<T>) as string | undefined;
  const cityValue = form.watch(cityField) as string | undefined;
  // The 13 countries and their few cities ship with the app: no request, no
  // loading state. A country outside them (an older profile, an employer
  // elsewhere) still gets its full city list from the API.
  const countries = pickerCountries(
    countryCode ? { code: countryCode, name: countryName ?? "" } : null,
  );
  const curated = curatedCities(countryCode);
  const cities = useCities(curated ? null : countryCode);
  const citiesPending = !curated && cities.isPending;

  // The city list is filtered here rather than by the combobox: a country can
  // have 15 000 cities, and rendering them all would lock up the phone.
  const [citySearch, setCitySearch] = useState("");
  const { options: cityOptions, truncated } = curated
    ? { options: toCityOptions(withCurrentCity(curated, cityValue)), truncated: 0 }
    : filterCities(cities.data, citySearch);

  // One column, always. Every caller renders inside a container capped well
  // below the md breakpoint -- the onboarding column, the job-offer form, the
  // edit-profile sheet -- so a viewport-based two-column split put both selects
  // side by side in ~240px each and truncated their labels to "Choisissez
  // d'abord un p...".
  return (
    <div className="grid grid-cols-1 gap-4">
      {!hideCountry && (
        <FormField
          control={form.control}
          name={countryField}
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel>{countryCityLabels.country.label}</FormLabel>
              <FormControl>
                <CategoryCombobox
                  options={toCountryOptions(countries)}
                  value={field.value || null}
                  onChange={(code) => {
                    const next = locationAfterCountryChange(code, countries);
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
                  container={container}
                />
              </FormControl>
              {countryHint && (
                <p className="text-xs text-muted-foreground">{countryHint}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name={cityField}
        render={({ field, fieldState }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>{countryCityLabels.city.label}</FormLabel>
            <FormControl>
              <CategoryCombobox
                options={cityOptions}
                value={field.value || null}
                onChange={(city) => field.onChange(city ?? "")}
                onBlur={field.onBlur}
                placeholder={cityPlaceholder(countryCode, citiesPending)}
                disabled={isCityDisabled(countryCode, citiesPending)}
                container={container}
                {...(curated
                  ? {}
                  : { search: citySearch, onSearchChange: setCitySearch })}
                footnote={
                  truncated > 0
                    ? `${truncated} autres — précisez votre recherche`
                    : undefined
                }
              />
            </FormControl>
            {/* Only once the field has been engaged with, or once a submit has
                been attempted. Picking a country clears the city by design, and
                that clearing used to paint "Sélectionnez une ville" in red
                immediately -- scolding someone for not having done something
                they had not yet been given the chance to do. The value is still
                validated throughout, so the submit button stays disabled. */}
            {(fieldState.isTouched || form.formState.isSubmitted) && (
              <FormMessage />
            )}
          </FormItem>
        )}
      />
    </div>
  );
}
