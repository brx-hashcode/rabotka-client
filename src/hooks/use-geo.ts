import { useQuery } from "@tanstack/react-query";
import { getCities, getCountries } from "@/lib/api/geo-controller";

/**
 * A reference list that effectively never changes within a session, so both
 * hooks cache for the whole session rather than the default 0ms. Without this
 * the country list is re-fetched every time the picker mounts — on the signup
 * step, over mobile data, for data that is identical each time.
 */
const REFERENCE_DATA_STALE_TIME = Number.POSITIVE_INFINITY;

export function useCountries() {
  return useQuery({
    queryKey: ["geo", "countries"],
    queryFn: getCountries,
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
}

/**
 * Cities of `countryCode`, or idle when no country is chosen yet.
 *
 * The city picker stays disabled until a country is selected, so `enabled`
 * here is what keeps it from firing a request for a country that does not
 * exist.
 */
export function useCities(countryCode: string | null | undefined) {
  return useQuery({
    queryKey: ["geo", "cities", countryCode],
    queryFn: () => getCities(countryCode!),
    enabled: Boolean(countryCode),
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
}
