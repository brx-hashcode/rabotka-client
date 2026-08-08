// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  AD_EVERY,
  FIRST_AD_AFTER,
  interleaveAds,
} from "@/features/sponsored/interleave";

/**
 * Where sponsored cards land in a feed.
 *
 * Pure and structural on purpose: the worker feed (offers) and the employer
 * feed (recommended profiles) share this one implementation, and the shared
 * jsdom environment currently fails to load its native `canvas` binding.
 */
const items = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: `j${i + 1}` }));

const ads = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ deliveryId: `d${i + 1}` }));

const adIndexes = <T extends { kind: string }>(entries: readonly T[]) =>
  entries.flatMap((entry, i) => (entry.kind === "ad" ? [i] : []));

describe("interleaveAds()", () => {
  it("returns the items untouched when there is nothing to advertise", () => {
    const list = items(5);
    const entries = interleaveAds(list, []);

    expect(entries).toHaveLength(5);
    expect(entries.every((e) => e.kind === "item")).toBe(true);
    expect(entries.map((e) => e.item)).toEqual(list);
  });

  it("never builds a feed of nothing but adverts", () => {
    // An empty feed shows its empty state; an ad alone on the screen would
    // read as the whole app being an advert.
    expect(interleaveAds([], ads(3))).toEqual([]);
  });

  it("drops an ad that would take the last position", () => {
    // Directly above «Voir plus», which makes the feed look like it ended on
    // an advert.
    expect(adIndexes(interleaveAds(items(3), ads(1)))).toEqual([]);
  });

  it("places the first ad after the third item", () => {
    const entries = interleaveAds(items(10), ads(1));

    expect(entries).toHaveLength(11);
    expect(adIndexes(entries)).toEqual([FIRST_AD_AFTER]);
  });

  it("spaces the ones after it by AD_EVERY items", () => {
    const entries = interleaveAds(items(20), ads(5));

    // Slots after items 3, 9 and 15 — never two in a row, and item 20 is last.
    expect(adIndexes(entries)).toEqual([3, 10, 17]);
    expect(entries.at(-1)?.kind).toBe("item");
    expect(FIRST_AD_AFTER + AD_EVERY).toBe(9);
  });

  it("uses each delivery once rather than cycling a short list", () => {
    const entries = interleaveAds(items(40), ads(2));
    const shown = entries.filter((e) => e.kind === "ad").map((e) => e.key);

    expect(shown).toEqual(["ad:d1", "ad:d2"]);
    expect(new Set(shown).size).toBe(shown.length);
  });

  it("grows by appending, so «Voir plus» never reshuffles the feed", () => {
    // The property the whole design rests on: a rendered card keeps its key
    // and its position, so nothing remounts and no impression fires twice.
    const full = interleaveAds(items(20), ads(5));

    for (let k = 1; k <= 20; k += 1) {
      const partial = interleaveAds(items(k), ads(5));
      expect(full.slice(0, partial.length)).toEqual(partial);
    }
  });

  it("keys an ad apart from an item that shares its id", () => {
    const entries = interleaveAds(
      Array.from({ length: 10 }, () => ({ id: "same" })),
      [{ deliveryId: "same" }],
    );
    const keys = entries.map((e) => e.key);

    expect(keys).toContain("ad:same");
    expect(keys).toContain("item:same");
  });

  it("works on any shape with an id, which is what the employer feed is", () => {
    const workers = Array.from({ length: 10 }, (_, i) => ({
      id: `w${i + 1}`,
      firstName: "Marie",
      reliabilityScore: 80,
    }));
    const entries = interleaveAds(workers, ads(1));

    expect(adIndexes(entries)).toEqual([FIRST_AD_AFTER]);
    expect(entries[0].item).toBe(workers[0]);
  });

  it("does not mutate its inputs", () => {
    const list = items(10);
    const pending = ads(2);

    interleaveAds(list, pending);

    expect(list).toHaveLength(10);
    expect(pending).toHaveLength(2);
  });
});
