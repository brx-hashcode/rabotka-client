// @vitest-environment node
// The arithmetic behind the composer's height — no DOM, no React runtime.
import { describe, expect, it } from "vitest";

import { autoGrowHeight } from "@/hooks/use-auto-grow-textarea";

const MAX = 132;

describe("autoGrowHeight", () => {
  it("takes the content's height while it fits", () => {
    expect(autoGrowHeight(44, MAX)).toEqual({ height: 44, overflows: false });
  });

  it("follows the content line by line", () => {
    // The bug this replaces: a box that sat at its min-height and let the text
    // scroll inside it. Every step has to move.
    const heights = [26, 48, 70, 92].map((h) => autoGrowHeight(h, MAX).height);
    expect(heights).toEqual([26, 48, 70, 92]);
  });

  it("stops at the ceiling and scrolls from there", () => {
    expect(autoGrowHeight(400, MAX)).toEqual({ height: MAX, overflows: true });
  });

  it("does not overflow at exactly the ceiling", () => {
    expect(autoGrowHeight(MAX, MAX)).toEqual({ height: MAX, overflows: false });
  });
});
