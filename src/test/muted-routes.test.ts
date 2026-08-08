// @vitest-environment node
// Pure, and kept out of the shared jsdom environment, which currently fails to
// load its native `canvas` binding.
import { describe, expect, it } from "vitest";
import { isMutedRoute } from "@/features/sponsored/muted-routes";

describe("isMutedRoute", () => {
  it("shows ads on ordinary app routes", () => {
    for (const route of ["/home", "/jobs", "/profile", "/missions"]) {
      expect(isMutedRoute(route)).toBe(false);
    }
  });

  it("stays quiet on the marketing landing but not on routes starting with it", () => {
    expect(isMutedRoute("/")).toBe(true);
    expect(isMutedRoute("/home")).toBe(false);
  });

  it("stays quiet during auth and onboarding", () => {
    expect(isMutedRoute("/login")).toBe(true);
    expect(isMutedRoute("/onboarding")).toBe(true);
    expect(isMutedRoute("/onboarding-avatar")).toBe(true);
    expect(isMutedRoute("/verify-whatsapp")).toBe(true);
  });

  it("stays quiet during payment and ad redirects", () => {
    expect(isMutedRoute("/pay/abc")).toBe(true);
    expect(isMutedRoute("/r/abc123")).toBe(true);
  });
});
