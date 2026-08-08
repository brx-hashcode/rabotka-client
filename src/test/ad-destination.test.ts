// @vitest-environment node
import { describe, expect, it } from "vitest";
import { isTrackedAdUrl } from "@/features/sponsored/destination";

/**
 * Which destinations record their own click.
 *
 * The `/r/:hash` hop marks the delivery seen on the way through; a raw
 * advertiser URL does not, so the card has to mark it locally instead. Getting
 * this backwards either loses the impression or double-counts it.
 */
describe("isTrackedAdUrl()", () => {
  it("recognises the redirect hop", () => {
    expect(isTrackedAdUrl("https://app.rabotka.work/r/abc123")).toBe(true);
  });

  it("does not claim an advertiser's own link", () => {
    expect(isTrackedAdUrl("https://advertiser.example/promo")).toBe(false);
  });

  it("looks at the path, not anywhere the string happens to appear", () => {
    // An advertiser is free to have /r/ in a query value or a hostname.
    expect(isTrackedAdUrl("https://advertiser.example/go?next=/r/abc")).toBe(
      false,
    );
    expect(isTrackedAdUrl("https://r.example.com/promo")).toBe(false);
  });

  it("treats an unparseable destination as untracked", () => {
    // Better to mark it locally and risk nothing than to assume a hop that
    // will never fire.
    expect(isTrackedAdUrl("not a url")).toBe(false);
  });
});
