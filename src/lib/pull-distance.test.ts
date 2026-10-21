// @vitest-environment node
import { describe, expect, it } from "vitest";
import { PULL_THRESHOLD, pullDistance } from "./pull-distance";

describe("pullDistance", () => {
  it("ignores an upward drag", () => {
    expect(pullDistance(-40)).toBe(0);
  });

  it("trails the finger at half speed", () => {
    expect(pullDistance(PULL_THRESHOLD)).toBe(PULL_THRESHOLD / 2);
  });

  it("stops at its cap", () => {
    expect(pullDistance(1000)).toBe(100);
  });
});
