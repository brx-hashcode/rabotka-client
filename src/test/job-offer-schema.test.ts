// @vitest-environment node
// The create-offer schema's cross-field rules — pure zod, no form, no DOM.
import { describe, expect, it } from "vitest";

import { createJobOfferSchema } from "@/lib/validations/job-offer";

/** Tomorrow, so the "4 hours ahead" rule is never what fails. */
const tomorrow = () => {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const base = {
  title: "Plombier pour réparation",
  description: "Une description suffisamment longue pour passer la validation.",
  employmentType: "MISSION" as const,
  scheduledDate: tomorrow(),
  scheduledTime: "",
  isRemote: false,
  countryCode: "CG",
  countryName: "Congo",
  city: "Brazzaville",
  address: "",
  quantity: 1,
  categoryId: "cat-plomberie",
};

/** The paths zod complained about, for readable assertions. */
const errorPaths = (input: unknown): string[] => {
  const result = createJobOfferSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => String(i.path[0]));
};

describe("address", () => {
  /**
   * The rule this file exists for.
   *
   * An address used to be required on anything not remote, which assumed
   * on-site means the worker travels to a street address. Most informal work
   * here is the other way round — a tailor, a mechanic, a hairdresser works at
   * their own place and the client comes to them.
   */
  it("is not required for an on-site offer", () => {
    expect(errorPaths(base)).not.toContain("address");
  });

  it("is still refused when half-written", () => {
    expect(errorPaths({ ...base, address: "rue" })).toContain("address");
  });

  it("is refused when half-written on a REMOTE offer too", () => {
    // Optional everywhere does not mean unvalidated anywhere.
    expect(errorPaths({ ...base, isRemote: true, address: "rue" })).toContain(
      "address",
    );
  });

  it("accepts a real one", () => {
    expect(
      errorPaths({ ...base, address: "123 Avenue de la Paix, Poto-Poto" }),
    ).toEqual([]);
  });
});

describe("city and country", () => {
  it("are still required on site — they carry the geography", () => {
    const paths = errorPaths({ ...base, countryCode: "", city: "" });
    expect(paths).toContain("countryCode");
    expect(paths).toContain("city");
  });

  it("are not asked of a remote offer", () => {
    const paths = errorPaths({
      ...base,
      isRemote: true,
      countryCode: "",
      city: "",
    });
    expect(paths).not.toContain("countryCode");
    expect(paths).not.toContain("city");
  });
});

describe("the date and the hour", () => {
  it("accepts a day with no hour — the hour is optional", () => {
    expect(errorPaths({ ...base, scheduledTime: "" })).toEqual([]);
  });

  it("accepts a day with an hour", () => {
    expect(errorPaths({ ...base, scheduledTime: "08:30" })).toEqual([]);
  });

  it("still requires the day", () => {
    expect(errorPaths({ ...base, scheduledDate: "" })).toContain(
      "scheduledDate",
    );
  });

  it("blames the HOUR when the hour is what is too early", () => {
    // Pointing at the date would have the employer change a day that was fine.
    const pad = (n: number) => String(n).padStart(2, "0");
    const now = new Date();
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    expect(
      errorPaths({ ...base, scheduledDate: today, scheduledTime: "00:01" }),
    ).toContain("scheduledTime");
  });
});

describe("domaine", () => {
  it("is required — it decides who hears about the offer", () => {
    expect(errorPaths({ ...base, categoryId: "" })).toContain("categoryId");
    expect(errorPaths(base)).not.toContain("categoryId");
  });
});
