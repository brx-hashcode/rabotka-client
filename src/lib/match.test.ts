// @vitest-environment node
import { describe, expect, it } from "vitest";
import { matchBand } from "./match";

describe("matchBand", () => {
  it("shows nothing without fit evidence", () => {
    expect(matchBand(null)).toBeNull();
    expect(matchBand(undefined)).toBeNull();
    expect(matchBand(Number.NaN)).toBeNull();
  });

  it("labels the bands", () => {
    expect(matchBand(0.78)).toEqual({ label: "Très compatible", percent: 78, tone: "high" });
    expect(matchBand(0.61)).toEqual({ label: "Compatible", percent: 61, tone: "mid" });
    expect(matchBand(0.22)).toEqual({ label: "Peu compatible", percent: 22, tone: "low" });
  });

  it("puts the boundaries in the higher band", () => {
    expect(matchBand(0.75)?.label).toBe("Très compatible");
    expect(matchBand(0.5)?.label).toBe("Compatible");
  });

  it("clamps out-of-range values", () => {
    expect(matchBand(1.4)?.percent).toBe(100);
    expect(matchBand(-0.2)?.percent).toBe(0);
  });
});
