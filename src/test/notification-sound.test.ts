// @vitest-environment node
import { describe, expect, it } from "vitest";
import { shouldChime } from "@/lib/notification-sound";

describe("shouldChime", () => {
  it("chimes for a notification while the app is on screen", () => {
    expect(shouldChime({ link: "/candidatures/a1" }, "/home", true)).toBe(true);
    expect(shouldChime({ link: null }, "/home", true)).toBe(true);
  });

  it("stays quiet when the page is hidden — the push makes its own sound", () => {
    expect(shouldChime({ link: "/candidatures/a1" }, "/home", false)).toBe(false);
  });

  it("stays quiet on the screen the notification points to", () => {
    expect(shouldChime({ link: "/discussions/c1" }, "/discussions/c1", true)).toBe(
      false,
    );
  });

  it("still chimes when the payload is missing", () => {
    expect(shouldChime(undefined, "/home", true)).toBe(true);
  });
});
