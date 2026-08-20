// @vitest-environment node
import { describe, expect, it } from "vitest";

import { sanitizePath } from "@/lib/analytics/sanitize-path";

/**
 * Everything this function returns is sent to Google. Several routes in this
 * app carry a working credential in the URL — a login token, a payment token,
 * a single-use WhatsApp link — so the leaks matter far more than the tidy
 * report does. Each test below names the thing that must not escape.
 */
describe("sanitizePath", () => {
  it("hides the payment token", () => {
    // `/pay/:token` opens a payment. Leaking it hands one out.
    expect(sanitizePath("/pay/9f2b8c1d4e")).toBe("/pay/:token");
    expect(sanitizePath("/pay/short")).toBe("/pay/:token");
  });

  it("hides single-use WhatsApp links", () => {
    // `/s/:code` and `/r/:hash` are minted per message and act as credentials.
    expect(sanitizePath("/s/x7f2q")).toBe("/s/:code");
    expect(sanitizePath("/r/ab12")).toBe("/r/:hash");
  });

  it("hides a portfolio slug, which is built from a person's name", () => {
    expect(sanitizePath("/p/jean-mabiala")).toBe("/p/:slug");
  });

  it("hides a dynamic segment nested under another", () => {
    // The `r` here is the second dynamic prefix in one path, so the check has
    // to run against the raw previous segment rather than the rewritten one.
    expect(sanitizePath("/p/jean-mabiala/r/7c9e6679-7425-40de-944b-e07fc1f90ae7")).toBe(
      "/p/:slug/r/:id",
    );
  });

  it("replaces uuids wherever they appear", () => {
    expect(sanitizePath("/claims/7c9e6679-7425-40de-944b-e07fc1f90ae7")).toBe("/claims/:id");
    expect(sanitizePath("/candidatures/7c9e6679-7425-40de-944b-e07fc1f90ae7/paiement")).toBe(
      "/candidatures/:id/paiement",
    );
  });

  it("replaces bare numbers and long opaque tokens", () => {
    expect(sanitizePath("/offres/12345")).toBe("/offres/:id");
    expect(sanitizePath("/offres/aVeryLongOpaqueToken123")).toBe("/offres/:id");
  });

  it("leaves static route names alone", () => {
    // The whole point is a readable report, so ordinary paths must survive —
    // including short segments that look id-ish but are not.
    expect(sanitizePath("/claims/new")).toBe("/claims/new");
    expect(sanitizePath("/profile/portfolio")).toBe("/profile/portfolio");
    expect(sanitizePath("/onboarding/success")).toBe("/onboarding/success");
    expect(sanitizePath("/verify/whatsapp")).toBe("/verify/whatsapp");
    expect(sanitizePath("/")).toBe("/");
  });

  it("takes a pathname, so a query string cannot reach it", () => {
    // `/verify/whatsapp?token=…` is the login link. The caller passes
    // `location.pathname`, never `location.href`; this documents the contract
    // that makes that safe.
    expect(sanitizePath("/verify/whatsapp")).toBe("/verify/whatsapp");
  });
});
