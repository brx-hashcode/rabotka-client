/**
 * The offer's date and its optional hour, and the single instant they make.
 *
 * The form carries them as TWO fields, because they are two questions and one
 * of them is optional. An earlier version kept a single `datetime-local`
 * string and encoded "no hour given" as 23:59 — which worked only while the
 * hour came from a fixed list that did not contain it. With a native time
 * input anyone can type 23:59, and the sentinel stopped being distinguishable
 * from a real answer. Two fields have no such ambiguity.
 */

/**
 * The hour an offer closes at when none was given: the end of the chosen day.
 *
 * Applied at the boundary, never stored in the form — "that day" is what the
 * employer said, and the server needs a time to put on it.
 */
export const END_OF_DAY = "23:59";

const pad = (n: number) => String(n).padStart(2, "0");

/** `YYYY-MM-DD` in LOCAL time — never `toISOString`, which shifts the day. */
export function toDateInput(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** `HH:mm` in local time. */
export function toTimeInput(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * The two fields as one `YYYY-MM-DDTHH:mm` instant, or "" without a date.
 *
 * A missing hour becomes the end of that day rather than the start of it: for
 * a closing date "le 30" means applications stay open through the 30th, and
 * midnight would shut them before the day began.
 */
export function composeScheduledAt(date: string, time: string): string {
  if (!date) return "";
  return `${date}T${time || END_OF_DAY}`;
}

/**
 * The `min` for the time input — set only when the chosen day IS the floor's
 * day, since on any later day every hour is allowed.
 *
 * Returns undefined rather than "00:00" for those, so the attribute is absent
 * instead of present and meaningless.
 */
export function minTimeFor(date: string, min: Date): string | undefined {
  return date === toDateInput(min) ? toTimeInput(min) : undefined;
}
