// @vitest-environment node
// Pure string functions — no DOM needed, and the shared jsdom environment
// currently fails to load its native `canvas` binding.
import { describe, expect, it } from "vitest";
import { fold, matchesSearch, foldedCommandFilter } from "@/lib/search";

describe("fold", () => {
  it("strips the accents the domain names are full of", () => {
    expect(fold("Maraîchage")).toBe("maraichage");
    expect(fold("Secrétariat")).toBe("secretariat");
    expect(fold("Revêtement")).toBe("revetement");
  });

  it("handles a cedilla, which is a diacritic on a consonant", () => {
    expect(fold("Maçonnerie")).toBe("maconnerie");
  });

  it("lower-cases and trims", () => {
    expect(fold("  Coiffure  ")).toBe("coiffure");
  });
});

describe("matchesSearch", () => {
  it("finds an accented name from an unaccented query", () => {
    // The reported case: nobody reaches for the accented key on a phone.
    expect(matchesSearch("maraichage", "Agriculture & Maraîchage")).toBe(true);
    expect(matchesSearch("MARAICHAGE", "Agriculture & Maraîchage")).toBe(true);
  });

  it("works in the other direction too", () => {
    expect(matchesSearch("maraîchage", "Agriculture & Maraichage")).toBe(true);
  });

  it("matches words out of order and across filler", () => {
    // The `de` between the typed words is what a plain `includes` trips on.
    expect(matchesSearch("vente viande", "Boucherie & Vente de viande")).toBe(
      true,
    );
    expect(matchesSearch("viande vente", "Boucherie & Vente de viande")).toBe(
      true,
    );
  });

  it("requires every word, not just one", () => {
    expect(matchesSearch("vente poisson", "Boucherie & Vente de viande")).toBe(
      false,
    );
  });

  it("matches everything on an empty or whitespace query", () => {
    expect(matchesSearch("", "Coiffure")).toBe(true);
    expect(matchesSearch("   ", "Coiffure")).toBe(true);
  });

  it("does not match an unrelated query", () => {
    expect(matchesSearch("plomberie", "Agriculture & Maraîchage")).toBe(false);
  });
});

describe("foldedCommandFilter", () => {
  it("scores an accent-insensitive hit, which cmdk's own scorer does not", () => {
    expect(foldedCommandFilter("Agriculture & Maraîchage", "maraichage")).toBe(
      1,
    );
  });

  it("scores a miss zero so cmdk hides the item", () => {
    expect(foldedCommandFilter("Agriculture & Maraîchage", "plomberie")).toBe(
      0,
    );
  });

  it("keeps every item visible while the input is empty", () => {
    expect(foldedCommandFilter("Coiffure", "")).toBe(1);
  });

  it("searches cmdk keywords alongside the value", () => {
    expect(foldedCommandFilter("Barbier", "rasage", ["coupe", "rasage"])).toBe(
      1,
    );
  });

  it("returns a flat score rather than a ranking", () => {
    // cmdk sorts by score; a graded one would reshuffle an alphabetical domain
    // list on every keystroke, which is harder to scan than a stable order.
    expect(foldedCommandFilter("Coiffure", "coiffure")).toBe(
      foldedCommandFilter("Conseil juridique", "conseil"),
    );
  });
});
