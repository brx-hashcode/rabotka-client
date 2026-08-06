// @vitest-environment node
import { describe, expect, it } from "vitest";

import { isNetworkError, isUnauthorized, serverMessage } from "@/lib/api/errors";

/** What the SDK throws before `handleError` flattens it. */
function apiError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

/**
 * These assertions encode a contract owned by mvc-front-sdk: its ApiService
 * turns a rejected fetch into `ApiError("Network error occurred", 0)`, and
 * BaseController.handleError rethrows it as a plain Error carrying only the
 * message. If an SDK upgrade changes that string, these fail — which is the
 * point, because nothing else downstream can tell the two failures apart.
 */
describe("isNetworkError", () => {
  it("recognises the SDK's transport-failure message", () => {
    expect(isNetworkError(new Error("Network error occurred"))).toBe(true);
  });

  it("does not treat a server refusal as a network fault", () => {
    expect(
      isNetworkError(
        new Error("Cette offre a déjà atteint sa capacité maximale"),
      ),
    ).toBe(false);
  });

  it("tolerates non-Error values", () => {
    expect(isNetworkError(undefined)).toBe(false);
    expect(isNetworkError(null)).toBe(false);
    expect(isNetworkError("Network error occurred")).toBe(false);
  });
});

describe("isUnauthorized", () => {
  it("recognises a refused session", () => {
    expect(isUnauthorized(apiError("Session invalide ou expirée", 401))).toBe(
      true,
    );
  });

  it("does not treat a transport failure as a logout", () => {
    // The SDK gives a rejected fetch `statusCode: 0`. Getting this wrong sends
    // a signed-in user on a flaky connection through the login screen.
    expect(isUnauthorized(apiError("Network error occurred", 0))).toBe(false);
  });

  it("does not treat a server fault as a logout", () => {
    expect(isUnauthorized(apiError("Erreur interne", 500))).toBe(false);
    expect(isUnauthorized(apiError("Token CSRF invalide", 403))).toBe(false);
  });

  it("is false once handleError has stripped the status", () => {
    // The safe direction: a caller that cannot tell must not claim the user is
    // signed out.
    expect(isUnauthorized(new Error("Session invalide ou expirée"))).toBe(false);
    expect(isUnauthorized(undefined)).toBe(false);
    expect(isUnauthorized(null)).toBe(false);
  });
});

describe("serverMessage", () => {
  it("returns the server's own wording", () => {
    const msg = "Votre compte est pénalisé.";
    expect(serverMessage(new Error(msg))).toBe(msg);
  });

  it("returns null for a transport failure", () => {
    // Otherwise a French-speaking user is shown the SDK's untranslated
    // "Network error occurred".
    expect(serverMessage(new Error("Network error occurred"))).toBeNull();
  });

  it("returns null when there is no usable message", () => {
    expect(serverMessage(new Error(""))).toBeNull();
    expect(serverMessage(new Error("   "))).toBeNull();
    expect(serverMessage(undefined)).toBeNull();
  });
});
