// @vitest-environment node
// Turning a date field and an optional time field into one instant.
import { describe, expect, it } from "vitest";

import {
  END_OF_DAY,
  composeScheduledAt,
  minTimeFor,
  toDateInput,
  toTimeInput,
} from "@/lib/scheduled-at";

describe("composeScheduledAt", () => {
  it("joins a date and an hour", () => {
    expect(composeScheduledAt("2026-09-30", "08:30")).toBe("2026-09-30T08:30");
  });

  /**
   * The decision this file exists to pin down.
   *
   * "Le 30" has to mean applications stay open THROUGH the 30th. Falling back
   * to midnight would shut them before the day began.
   */
  it("falls back to the END of the day when no hour was given", () => {
    expect(composeScheduledAt("2026-09-30", "")).toBe(
      `2026-09-30T${END_OF_DAY}`,
    );
  });

  it("is empty without a date, so the caller never builds an Invalid Date", () => {
    expect(composeScheduledAt("", "08:30")).toBe("");
    expect(composeScheduledAt("", "")).toBe("");
  });

  it("produces something Date can actually parse", () => {
    const parsed = new Date(composeScheduledAt("2026-09-30", ""));
    expect(Number.isNaN(parsed.getTime())).toBe(false);
    expect(parsed.getDate()).toBe(30);
    expect(parsed.getHours()).toBe(23);
  });
});

describe("toDateInput / toTimeInput", () => {
  it("keeps the LOCAL day and hour", () => {
    // Built from local parts, never `toISOString` — which would move a late
    // evening in Brazzaville onto the next day.
    const late = new Date(2026, 0, 1, 23, 5);
    expect(toDateInput(late)).toBe("2026-01-01");
    expect(toTimeInput(late)).toBe("23:05");
  });

  it("pads single digits, as the inputs require", () => {
    expect(toDateInput(new Date(2026, 8, 3, 9, 7))).toBe("2026-09-03");
    expect(toTimeInput(new Date(2026, 8, 3, 9, 7))).toBe("09:07");
  });
});

describe("minTimeFor", () => {
  const min = new Date(2026, 8, 24, 14, 10);

  it("bounds the hour on the floor's OWN day", () => {
    expect(minTimeFor("2026-09-24", min)).toBe("14:10");
  });

  it("leaves any later day unbounded", () => {
    // Every hour is legal then, and a min would be present and meaningless.
    expect(minTimeFor("2026-09-25", min)).toBeUndefined();
  });

  it("is undefined before a date is chosen", () => {
    expect(minTimeFor("", min)).toBeUndefined();
  });
});
