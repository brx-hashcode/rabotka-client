// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  isSignupVerificationError,
  isSignupVerified,
  normalizeSignupPhone,
} from "./signup-verification";

const NOW = 1_800_000_000_000;
const verification = {
  token: "tok",
  phone: "+242061234567",
  expiresAt: NOW + 30 * 60_000,
};

describe("isSignupVerified", () => {
  it("covers the number it was issued for", () => {
    expect(isSignupVerified(verification, " +242061234567 ", NOW)).toBe(true);
  });

  it("does not cover a number changed since", () => {
    expect(isSignupVerified(verification, "+242069999999", NOW)).toBe(false);
  });

  it("is over within a minute of expiry", () => {
    expect(
      isSignupVerified(verification, "+242061234567", verification.expiresAt - 30_000),
    ).toBe(false);
  });

  it("is nothing without a token", () => {
    expect(isSignupVerified(null, "+242061234567", NOW)).toBe(false);
  });
});

describe("normalizeSignupPhone", () => {
  it("matches the API: trimmed and lower-cased", () => {
    expect(normalizeSignupPhone("  +242 ABC ")).toBe("+242 abc");
  });
});

describe("isSignupVerificationError", () => {
  it("recognises the API's refusal", () => {
    expect(
      isSignupVerificationError(
        new Error("Vérifiez votre numéro de téléphone avant de créer votre compte."),
      ),
    ).toBe(true);
  });

  it("ignores other errors", () => {
    expect(isSignupVerificationError(new Error("Réseau indisponible"))).toBe(false);
  });
});
