import { RabotkaBaseController } from "./base-controller";

export type Country = { code: string; name: string };

/**
 * The country/city reference list.
 *
 * Served by our own API rather than fetched from a public dataset in the
 * browser: this feeds signup, which runs on unreliable mobile data, and a third
 * party being slow or down must not be able to stop someone registering.
 */
class GeoController extends RabotkaBaseController {
  getCountries(): Promise<Country[]> {
    return this.get<Country[]>("/public/geo/countries");
  }

  getCities(countryCode: string): Promise<string[]> {
    return this.get<string[]>(
      `/public/geo/countries/${encodeURIComponent(countryCode)}/cities`,
    );
  }
}

const controller = new GeoController();

// Annotated explicitly for the same reason as system-config-controller: `.bind()`
// drops the method signature and callers would otherwise receive `unknown`.
export const getCountries: () => Promise<Country[]> =
  controller.getCountries.bind(controller);
export const getCities: (countryCode: string) => Promise<string[]> =
  controller.getCities.bind(controller);
