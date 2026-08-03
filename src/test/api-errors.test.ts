// @vitest-environment node
import { describe, expect, it } from "vitest";

import { isNetworkError, serverMessage } from "@/lib/api/errors";

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
