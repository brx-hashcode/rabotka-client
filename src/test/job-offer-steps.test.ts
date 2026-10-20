// @vitest-environment node
import { describe, expect, it } from "vitest";
import { EMPTY_JOB_OFFER_FORM } from "@/lib/job-offer-form";
import {
  clearJobOfferDraft,
  JOB_OFFER_STEPS,
  readJobOfferDraft,
  stepOfFirstError,
  writeJobOfferDraft,
} from "@/lib/job-offer-steps";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    map,
  };
}

const KEY = "draft";
const NOW = Date.UTC(2026, 9, 20, 12);
const typed = { ...EMPTY_JOB_OFFER_FORM, title: "Plombier", city: "Brazzaville" };

describe("JOB_OFFER_STEPS", () => {
  it("puts every form field on exactly one step", () => {
    const placed = JOB_OFFER_STEPS.flatMap((s) => s.fields);
    expect(new Set(placed).size).toBe(placed.length);
    expect([...placed].sort()).toEqual(Object.keys(EMPTY_JOB_OFFER_FORM).sort());
  });

  it("asks for the domain on the first step", () => {
    expect(JOB_OFFER_STEPS[0].fields).toContain("categoryId");
  });
});

describe("stepOfFirstError", () => {
  it("sends the employer back to the earliest step with a problem", () => {
    expect(stepOfFirstError({ scheduledDate: {}, amount: {} })).toBe(1);
    expect(stepOfFirstError({ amount: {}, title: {} })).toBe(0);
  });

  it("stays on the last step for an error no step owns", () => {
    expect(stepOfFirstError({ root: {} })).toBe(JOB_OFFER_STEPS.length - 1);
  });
});

describe("job offer draft", () => {
  it("round-trips what was typed", () => {
    const s = memoryStorage();
    writeJobOfferDraft(s, KEY, typed, EMPTY_JOB_OFFER_FORM, NOW);
    expect(readJobOfferDraft(s, KEY, EMPTY_JOB_OFFER_FORM, NOW)).toEqual(typed);
  });

  it("does not store an untouched form", () => {
    const s = memoryStorage();
    writeJobOfferDraft(s, KEY, EMPTY_JOB_OFFER_FORM, EMPTY_JOB_OFFER_FORM, NOW);
    expect(s.map.size).toBe(0);
  });

  it("removes the draft when the form is emptied again", () => {
    const s = memoryStorage();
    writeJobOfferDraft(s, KEY, typed, EMPTY_JOB_OFFER_FORM, NOW);
    writeJobOfferDraft(s, KEY, EMPTY_JOB_OFFER_FORM, EMPTY_JOB_OFFER_FORM, NOW);
    expect(s.map.size).toBe(0);
  });

  it("forgets a draft older than a week", () => {
    const s = memoryStorage();
    writeJobOfferDraft(s, KEY, typed, EMPTY_JOB_OFFER_FORM, NOW);
    const eightDays = 8 * 24 * 60 * 60 * 1000;
    expect(readJobOfferDraft(s, KEY, EMPTY_JOB_OFFER_FORM, NOW + eightDays)).toBeNull();
  });

  it("ignores garbage and a storage that throws", () => {
    const s = memoryStorage();
    s.setItem(KEY, "{not json");
    expect(readJobOfferDraft(s, KEY, EMPTY_JOB_OFFER_FORM, NOW)).toBeNull();
    const broken = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
      removeItem: () => {
        throw new Error("denied");
      },
    };
    expect(readJobOfferDraft(broken, KEY, EMPTY_JOB_OFFER_FORM, NOW)).toBeNull();
    expect(() =>
      writeJobOfferDraft(broken, KEY, typed, EMPTY_JOB_OFFER_FORM, NOW),
    ).not.toThrow();
    expect(() => clearJobOfferDraft(broken, KEY)).not.toThrow();
  });
});
