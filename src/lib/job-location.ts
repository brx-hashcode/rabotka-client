/** What a remote job shows where an address would otherwise go. */
export const REMOTE_LOCATION_LABEL = "En ligne";

type JobLocation = {
  address?: string | null;
  isRemote?: boolean | null;
  city?: string | null;
  countryName?: string | null;
};

/**
 * A job's location as one line.
 *
 * `address` is null for a remote job, and every card, list row and detail
 * screen needs something to print. Centralising it means a remote job reads
 * "En ligne" everywhere rather than each screen inventing its own placeholder
 * — or, worse, rendering a bare pin icon with nothing beside it.
 */
export function jobLocationLabel(job: JobLocation): string {
  if (job.isRemote) return REMOTE_LOCATION_LABEL;
  const address = job.address?.trim();
  return address || REMOTE_LOCATION_LABEL;
}

/**
 * The same line with the city appended when it adds something.
 *
 * For detail screens, where there is room. The city is skipped when the address
 * already contains it, which is the common case for offers created before the
 * pickers existed — repeating "Brazzaville, Brazzaville" reads like a bug.
 */
export function jobLocationDetail(job: JobLocation): string {
  if (job.isRemote) return REMOTE_LOCATION_LABEL;
  const address = job.address?.trim();
  const city = job.city?.trim();
  if (!address) return city || REMOTE_LOCATION_LABEL;
  if (!city || address.toLowerCase().includes(city.toLowerCase())) {
    return address;
  }
  return `${address}, ${city}`;
}
