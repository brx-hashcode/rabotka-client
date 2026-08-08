// @vitest-environment node
import { describe, expect, it } from "vitest";
import { isRenderableAd, mergeAdSlate } from "@/features/sponsored/slate";
import type { InAppAd } from "@/lib/api/ad-inbox-controller";

const ad = (deliveryId: string, over: Partial<InAppAd> = {}): InAppAd => ({
  deliveryId,
  advertisementId: `a-${deliveryId}`,
  title: "Formation en soudure",
  description: "Trois mois, certifiante.",
  imageUrl: "https://cdn.example/banner.jpg",
  callToAction: "En savoir plus",
  ctaUrl: "https://app.rabotka.work/r/abc123",
  tags: [],
  ...over,
});

describe("mergeAdSlate()", () => {
  it("keeps showing an ad the inbox has already dropped", () => {
    // Marking a delivery seen removes it from the query cache right away. The
    // card must not disappear from under the reader's thumb.
    const slate = mergeAdSlate([ad("d1")], []);

    expect(slate.map((a) => a.deliveryId)).toEqual(["d1"]);
  });

  it("appends a newly dispatched ad below the ones already on screen", () => {
    const slate = mergeAdSlate([ad("d1")], [ad("d2"), ad("d1")]);

    expect(slate.map((a) => a.deliveryId)).toEqual(["d1", "d2"]);
  });

  it("never shows the same delivery twice", () => {
    const slate = mergeAdSlate([ad("d1")], [ad("d1"), ad("d1")]);

    expect(slate).toHaveLength(1);
  });

  it("returns the same array when nothing changed", () => {
    // The inbox refetches every few minutes; a fresh array each time would
    // re-render the feed and tear down the impression observers mid-count.
    const current = [ad("d1"), ad("d2")];

    expect(mergeAdSlate(current, [ad("d2"), ad("d1")])).toBe(current);
  });
});

describe("isRenderableAd()", () => {
  it("accepts an ad with no image as long as it has a title", () => {
    expect(isRenderableAd(ad("d1", { imageUrl: null }))).toBe(true);
  });

  it("accepts an image-only ad", () => {
    expect(isRenderableAd(ad("d1", { title: "" }))).toBe(true);
  });

  it("keeps an ad with no destination", () => {
    // It renders without its button. Skipping it would leave the delivery
    // pending forever, and the inbox holds only five — it would block every
    // campaign queued behind it.
    expect(isRenderableAd(ad("d1", { ctaUrl: null }))).toBe(true);
  });

  it("rejects an ad with neither a title nor an image", () => {
    expect(isRenderableAd(ad("d1", { title: "   ", imageUrl: null }))).toBe(
      false,
    );
  });
});
