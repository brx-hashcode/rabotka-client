// @vitest-environment node
import { describe, expect, it } from "vitest";
import { keyboardFrame } from "@/hooks/use-keyboard-frame";

describe("keyboardFrame", () => {
  it("is null with no keyboard: the visible area is the page", () => {
    expect(keyboardFrame({ height: 852, offsetTop: 0 }, 852)).toBeNull();
  });

  it("ignores a browser toolbar collapsing", () => {
    expect(keyboardFrame({ height: 790, offsetTop: 0 }, 852)).toBeNull();
  });

  it("pins to the area above an iPhone keyboard, offset included", () => {
    // iOS keeps the page 852 tall and scrolls it 290px under a 336px keyboard.
    expect(keyboardFrame({ height: 516, offsetTop: 290.4 }, 852)).toEqual({
      top: 290,
      height: 516,
    });
  });

  it("is null where there is no visual viewport", () => {
    expect(keyboardFrame(null, 852)).toBeNull();
  });
});
