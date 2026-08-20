// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * With no measurement id configured, analytics must be inert. Not "sends to a
 * dev property", not "logs a warning": nothing loaded, nothing sent.
 *
 * The environment is stubbed rather than inherited from whatever `.env` the
 * developer happens to have. An earlier version of this file asserted against
 * the ambient value and passed only while the id was blank — it started
 * failing the moment a real one was configured, which is the wrong way round:
 * the guarantee is about the code, not about the machine it runs on.
 *
 * The node environment does double duty. There is no `window` at all, so a
 * function that reached for the DOM before checking whether analytics is
 * configured would throw rather than quietly no-op — which makes this a test
 * of the guard itself, not merely of a return value.
 */
describe("analytics with no measurement id", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "");
    // The id is read once at module scope, so the module has to be re-imported
    // after the stub is in place.
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("reports itself as disabled", async () => {
    const { analyticsEnabled } = await import("@/lib/analytics/gtag");
    expect(analyticsEnabled()).toBe(false);
  });

  it("never touches the document", async () => {
    const { initAnalytics, trackEvent, trackPageView } = await import("@/lib/analytics/gtag");
    const { trackWhatsAppClick } = await import("@/lib/analytics/events");

    expect(() => initAnalytics()).not.toThrow();
    expect(() => trackPageView("/claims/:id", "Réclamations")).not.toThrow();
    expect(() => trackEvent("whatsapp_click", { audience: "worker" })).not.toThrow();
    expect(() => trackWhatsAppClick("worker", "hero")).not.toThrow();
  });
});

/**
 * The mirror case: an id IS configured, but there is no DOM — a server render,
 * a worker, a test. Reporting still must not throw, which is what the `window`
 * half of the `analyticsEnabled` guard buys. Without it, `trackPageView`
 * reaches `window.dataLayer` and takes the render down with it.
 */
describe("analytics configured but without a DOM", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TESTID0000");
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("stays inert instead of throwing", async () => {
    const { analyticsEnabled, initAnalytics, trackPageView } = await import(
      "@/lib/analytics/gtag"
    );

    expect(analyticsEnabled()).toBe(false);
    expect(() => initAnalytics()).not.toThrow();
    expect(() => trackPageView("/", "Rabotka")).not.toThrow();
  });
});
