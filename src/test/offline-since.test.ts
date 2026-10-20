// @vitest-environment node
import { describe, expect, it } from "vitest";
import { offlineLabel, offlineSince } from "@/features/offline/offline-since";

describe("offlineSince", () => {
  const now = new Date(2026, 9, 20, 18, 0);

  it("says today, yesterday, or the date", () => {
    expect(offlineSince(new Date(2026, 9, 20, 14, 30).getTime(), now)).toBe(
      "aujourd'hui à 14 h 30",
    );
    expect(offlineSince(new Date(2026, 9, 19, 9, 5).getTime(), now)).toBe(
      "hier à 09 h 05",
    );
    expect(offlineSince(new Date(2026, 9, 14, 14, 30).getTime(), now)).toMatch(
      /^14 oct\.? à 14 h 30$/,
    );
  });
});

describe("offlineLabel", () => {
  const now = new Date(2026, 9, 20, 18, 0);
  it("reads as a sentence whatever the day", () => {
    expect(offlineLabel(new Date(2026, 9, 20, 14, 30).getTime(), now)).toBe(
      "Hors ligne · données d'aujourd'hui à 14 h 30",
    );
    expect(offlineLabel(new Date(2026, 9, 19, 9, 5).getTime(), now)).toBe(
      "Hors ligne · données d'hier à 09 h 05",
    );
    expect(offlineLabel(new Date(2026, 9, 14, 8, 0).getTime(), now)).toMatch(
      /^Hors ligne · données du 14 oct\.? à 08 h 00$/,
    );
    expect(offlineLabel(null, now)).toBe("Hors ligne");
  });
});
