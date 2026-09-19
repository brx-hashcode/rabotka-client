// @vitest-environment node
import { describe, it, expect } from "vitest";

import { postExcerpt, postLabel } from "@/features/portfolio/post-text";

describe("postExcerpt", () => {
  it("returns nothing for an images-only publication", () => {
    expect(postExcerpt(null)).toEqual({ text: "", truncated: false });
    expect(postExcerpt("   ")).toEqual({ text: "", truncated: false });
  });

  it("leaves a short post whole and unmarked", () => {
    const body = "Disponible cette semaine à Bacongo.";
    expect(postExcerpt(body)).toEqual({ text: body, truncated: false });
  });

  it("cuts a long post on a word boundary, never mid-word", () => {
    const body = "mur ".repeat(200).trim();
    const { text, truncated } = postExcerpt(body);

    expect(truncated).toBe(true);
    expect(text.length).toBeLessThanOrEqual(280);
    // A caption sliced mid-word reads as corrupted text, not as an excerpt.
    expect(body.startsWith(text)).toBe(true);
    expect(text.endsWith("mur")).toBe(true);
  });

  it("cuts a post with many lines and says so", () => {
    const { text, truncated } = postExcerpt("a\nb\nc\nd\ne\nf\ng\nh");
    expect(text).toBe("a\nb\nc\nd\ne\nf");
    expect(truncated).toBe(true);
  });

  it("keeps a six-line post whole", () => {
    const { truncated } = postExcerpt("a\nb\nc\nd\ne\nf");
    expect(truncated).toBe(false);
  });
});

describe("postLabel", () => {
  it("uses the first line of the text", () => {
    expect(postLabel("Réfection d'un mur\n\nDétails ici", 2)).toBe(
      "Réfection d'un mur",
    );
  });

  it("truncates a very long first line with an ellipsis", () => {
    const label = postLabel("x".repeat(200), 0);
    expect(label.length).toBeLessThanOrEqual(61);
    expect(label.endsWith("…")).toBe(true);
  });

  it("names the photos when a publication has no text", () => {
    // An images-only post is a normal publication, not a defective one, so it
    // must not read identically to every other in a list read aloud.
    expect(postLabel(null, 3)).toBe("Publication — 3 images");
    expect(postLabel(null, 1)).toBe("Publication — 1 image");
    expect(postLabel("", 0)).toBe("Publication");
  });
});
