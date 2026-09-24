// @vitest-environment node
// The arithmetic behind the date/time sheet — no DOM, no calendar.
import { describe, expect, it } from "vitest";

import {
  hasExplicitTime,
  parseValue,
  timeOptions,
  toValue,
} from "@/lib/date-time-value";

/** 2026-09-24 at 14:10 local. */
const day = () => new Date(2026, 8, 24, 14, 10);
const nextDay = () => new Date(2026, 8, 25, 9, 0);

describe("toValue / parseValue", () => {
  it("round-trips through the datetime-local shape", () => {
    const value = toValue(day(), 9 * 60 + 30);
    expect(value).toBe("2026-09-24T09:30");

    const parsed = parseValue(value);
    expect(parsed?.minutesOfDay).toBe(9 * 60 + 30);
    expect(parsed?.day.getDate()).toBe(24);
  });

  it("keeps the LOCAL day, whatever the timezone offset", () => {
    // Built from the local parts, never `toISOString` — which would move an
    // evening in Brazzaville onto the previous or next day.
    expect(toValue(new Date(2026, 0, 1, 23, 0), 0)).toBe("2026-01-01T00:00");
  });

  it("returns null for nothing chosen", () => {
    expect(parseValue("")).toBeNull();
  });
});

describe("hasExplicitTime", () => {
  it("treats 23:59 as 'a day, no particular hour'", () => {
    expect(hasExplicitTime(23 * 60 + 59)).toBe(false);
  });

  it("treats anything pickable as a real time", () => {
    for (const m of [0, 8 * 60, 14 * 60 + 15, 23 * 60 + 45]) {
      expect(hasExplicitTime(m)).toBe(true);
    }
  });

  it("is unreachable by the picker, which is what makes it a safe sentinel", () => {
    // The list steps by 15 minutes, so 23:45 is the last option anyone can
    // tap. If a step ever divides 23:59, this stops being unambiguous.
    expect(timeOptions(day(), new Date(2026, 8, 24, 0, 0))).not.toContain(
      23 * 60 + 59,
    );
  });
});

describe("timeOptions", () => {
  it("offers the whole day when the floor is earlier", () => {
    const options = timeOptions(nextDay(), day());
    expect(options[0]).toBe(0);
    expect(options).toHaveLength((24 * 60) / 15);
  });

  it("hides every slot before the floor on the floor's own day", () => {
    // The floor is 14:10, so 14:00 is gone and 14:15 is the first on offer.
    const options = timeOptions(day(), day());
    expect(options).not.toContain(14 * 60);
    expect(options[0]).toBe(14 * 60 + 15);
  });

  it("never offers a slot the server would refuse", () => {
    const min = day();
    const floor = min.getHours() * 60 + min.getMinutes();
    for (const m of timeOptions(min, min)) expect(m).toBeGreaterThanOrEqual(floor);
  });
});
