// @vitest-environment node
// Pure schema derivation — and the only testable form these rules can take,
// since jsdom cannot start in this repo (its native `canvas` binding fails to
// load).
import { describe, expect, it } from "vitest";
import { step1Schema } from "@/lib/validations/onboarding";
import { editProfileSchema } from "@/lib/validations/profile";

/**
 * Email is optional everywhere it appears.
 *
 * Most of the informal sector has a phone and no email address. Requiring one
 * did not produce email addresses — it produced invented ones that bounce — so
 * the WhatsApp number carries the identity and email is a convenience.
 *
 * The rule that matters in both schemas: an EMPTY value is absent, not invalid.
 * An untouched input yields "", and validating that as a malformed address
 * would block the form at its last step for exactly the people this change
 * exists to let in — with an error they cannot clear by typing anything.
 */

const validStep1 = {
  firstName: "Pascal",
  lastName: "Sanscourriel",
  phone: "+242069917686",
  countryCode: "CG",
  countryName: "Congo-Brazzaville",
  city: "Brazzaville",
  address: "12 rue Foch",
  description: "Maçon, finition, Pointe-Noire",
};

describe("onboarding step 1 — email", () => {
  it("accepts a signup with no email at all", () => {
    expect(step1Schema.safeParse(validStep1).success).toBe(true);
  });

  it("accepts an empty string, which is what an untouched input yields", () => {
    expect(
      step1Schema.safeParse({ ...validStep1, email: "" }).success,
    ).toBe(true);
  });

  it("still rejects a malformed address when one is actually typed", () => {
    // Optional is not lax: a typo'd address is worse than none, because the
    // invoices it silently swallows are never missed until someone asks.
    const result = step1Schema.safeParse({
      ...validStep1,
      email: "pascal@",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a well-formed address", () => {
    expect(
      step1Schema.safeParse({ ...validStep1, email: "pascal@example.com" })
        .success,
    ).toBe(true);
  });
});

const validEdit = {
  firstName: "Pascal",
  lastName: "Sanscourriel",
  countryCode: "CG",
  countryName: "Congo-Brazzaville",
  city: "Brazzaville",
  address: "12 rue Foch",
  description: "Maçon",
};

describe("edit profile — email", () => {
  it("accepts a profile edit that never mentions email", () => {
    expect(editProfileSchema.safeParse(validEdit).success).toBe(true);
  });

  it("accepts an empty string, which is how an address gets removed", () => {
    expect(
      editProfileSchema.safeParse({ ...validEdit, email: "" }).success,
    ).toBe(true);
  });

  it("lets someone add an address they did not have at signup", () => {
    const result = editProfileSchema.safeParse({
      ...validEdit,
      email: "pascal@example.com",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a malformed address", () => {
    expect(
      editProfileSchema.safeParse({ ...validEdit, email: "not-an-email" })
        .success,
    ).toBe(false);
  });
});
