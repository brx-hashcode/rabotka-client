// @vitest-environment node
import { describe, expect, it } from "vitest";
import { quoteOfTheDay, WORK_QUOTES } from "@/features/home/components/work-quote";

describe("quoteOfTheDay", () => {
  it("keeps the same quote all day", () => {
    expect(quoteOfTheDay(new Date(2026, 9, 20, 0, 1))).toBe(
      quoteOfTheDay(new Date(2026, 9, 20, 23, 59)),
    );
  });

  it("moves to the next quote the next day", () => {
    const today = WORK_QUOTES.indexOf(quoteOfTheDay(new Date(2026, 9, 20)));
    const tomorrow = WORK_QUOTES.indexOf(quoteOfTheDay(new Date(2026, 9, 21)));
    expect(tomorrow).toBe((today + 1) % WORK_QUOTES.length);
  });

  it("goes through every quote in a cycle", () => {
    const seen = new Set(
      WORK_QUOTES.map((_, i) => quoteOfTheDay(new Date(2026, 0, 1 + i))),
    );
    expect(seen.size).toBe(WORK_QUOTES.length);
  });
});
