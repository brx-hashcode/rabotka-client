/**
 * The arithmetic behind `DateTimePicker`, kept apart from the component.
 *
 * Its own module so it can be tested without a DOM, and so the picker file
 * exports a component and nothing else.
 */

/** Minutes between two offered times. */
export const STEP_MINUTES = 15;

/**
 * "A day, no particular hour", stored as 23:59.
 *
 * The hour is optional — an employer often knows the day and settles the time
 * with whoever answers — but the value the picker writes is a single
 * `datetime-local` string, which always carries one. 23:59 is the end of the
 * chosen day, which is what "that day" means for a closing date.
 *
 * It is unambiguous rather than a guess: the list steps by {@link STEP_MINUTES}
 * minutes, so the last hour anyone can actually tap is 23:45. 23:59 can only
 * have come from here, which is what lets the field show a bare date without
 * wondering whether somebody meant one minute to midnight.
 */
export const NO_TIME = 23 * 60 + 59;

const pad = (n: number) => String(n).padStart(2, "0");

/** `YYYY-MM-DD` in LOCAL time — never `toISOString`, which shifts the day. */
export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The `datetime-local` string the picker reads and writes. */
export function toValue(day: Date, minutesOfDay: number): string {
  return `${dayKey(day)}T${pad(Math.floor(minutesOfDay / 60))}:${pad(minutesOfDay % 60)}`;
}

/** Parses that same string back, or null when there is nothing chosen yet. */
export function parseValue(
  value: string,
): { day: Date; minutesOfDay: number } | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return {
    day: parsed,
    minutesOfDay: parsed.getHours() * 60 + parsed.getMinutes(),
  };
}

/** Whether a stored value carries a real hour or only a day. */
export function hasExplicitTime(minutesOfDay: number): boolean {
  return minutesOfDay !== NO_TIME;
}

/**
 * Every time on a given day that is not already past the floor.
 *
 * "Today, after the minimum" is the case that decides whether the picker can
 * offer a slot the server would refuse.
 */
export function timeOptions(day: Date, min: Date): number[] {
  const sameDayAsMin = dayKey(day) === dayKey(min);
  const floor = sameDayAsMin ? min.getHours() * 60 + min.getMinutes() : 0;
  const out: number[] = [];
  for (let m = 0; m < 24 * 60; m += STEP_MINUTES) {
    if (m >= floor) out.push(m);
  }
  return out;
}

export function formatTime(minutesOfDay: number): string {
  return `${pad(Math.floor(minutesOfDay / 60))}:${pad(minutesOfDay % 60)}`;
}
