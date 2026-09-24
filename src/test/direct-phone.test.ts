// @vitest-environment node
// The two phone numbers answer different questions, and only one is local.
import { describe, expect, it } from "vitest";

import { step1Schema } from "@/lib/validations/onboarding";

/** A valid Congolese mobile, and a valid French one. */
const CG = "+242061234567";
const FR = "+33612345678";

const base = {
  firstName: "Jean",
  lastName: "Mabiala",
  email: "",
  phone: FR,
  directPhone: "",
  countryCode: "CG",
  countryName: "Congo-Brazzaville",
  city: "Brazzaville",
  address: "Moungali, 30 rue Bondo",
  description: "Manutentionnaire entrepôts, chargement camions.",
};

const errorPaths = (input: unknown): string[] => {
  const result = step1Schema.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => String(i.path[0]));
};

describe("the WhatsApp number", () => {
  /**
   * Open to every country on purpose: people sign up from the diaspora, and
   * this is the number signup actually proves.
   */
  it("accepts a foreign number", () => {
    expect(errorPaths({ ...base, phone: FR })).not.toContain("phone");
  });

  it("accepts a Congolese one too", () => {
    expect(errorPaths({ ...base, phone: CG })).not.toContain("phone");
  });
});

describe("the direct number", () => {
  it("is still optional", () => {
    expect(errorPaths({ ...base, directPhone: "" })).not.toContain(
      "directPhone",
    );
    expect(errorPaths({ ...base, directPhone: undefined })).not.toContain(
      "directPhone",
    );
  });

  it("accepts a Congolese number", () => {
    expect(errorPaths({ ...base, directPhone: CG })).not.toContain(
      "directPhone",
    );
  });

  /**
   * The rule this file exists for. It is the line an employer on the ground is
   * expected to DIAL — an international number there is a call nobody local
   * will place.
   */
  it("refuses a foreign number, unlike the WhatsApp one", () => {
    expect(errorPaths({ ...base, phone: CG, directPhone: FR })).toContain(
      "directPhone",
    );
  });

  it("judges the number, not the way it was typed", () => {
    // Parsed to a country rather than prefix-matched on "+242", so spacing and
    // a 00 prefix are the same number.
    expect(errorPaths({ ...base, directPhone: "+242 06 123 45 67" })).not.toContain(
      "directPhone",
    );
  });

  it("still refuses nonsense", () => {
    expect(errorPaths({ ...base, directPhone: "12" })).toContain("directPhone");
  });
});
