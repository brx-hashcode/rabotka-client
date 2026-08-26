// @vitest-environment node
//
// Node, like every other suite here — jsdom does not load in this install, so
// the DOM this module needs is one `localStorage` stub, installed below. That
// is the whole surface it touches, and stubbing it also lets the storage-throws
// cases be exercised, which a real localStorage will not do on demand.
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  clearReferralAttribution,
  normalizeReferralCode,
  readReferralAttribution,
  saveReferralAttribution,
} from "@/lib/referral-attribution";

const KEY = "rabotka_referral";

function installLocalStorageStub() {
  let store = new Map<string, string>();
  const stub = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => void (store = new Map()),
  };
  Object.defineProperty(globalThis, "localStorage", {
    value: stub,
    configurable: true,
    writable: true,
  });
  return stub;
}

describe("normalizeReferralCode", () => {
  it("accepts what people actually paste and type", () => {
    expect(normalizeReferralCode(" k7m2xq ")).toBe("K7M2XQ");
    expect(normalizeReferralCode("K7M-2XQ")).toBe("K7M2XQ");
    expect(normalizeReferralCode("k7 m2 xq")).toBe("K7M2XQ");
  });

  it("rejects anything that could not be a code", () => {
    expect(normalizeReferralCode("K7M2X")).toBeNull(); // too short
    expect(normalizeReferralCode("K7M2XQZ")).toBeNull(); // too long
    expect(normalizeReferralCode("K0M2XQ")).toBeNull(); // 0 is excluded
    expect(normalizeReferralCode("KIM2XQ")).toBeNull(); // I is excluded
    expect(normalizeReferralCode("")).toBeNull();
    expect(normalizeReferralCode(null)).toBeNull();
  });
});

describe("referral attribution storage", () => {
  beforeEach(() => {
    installLocalStorageStub();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("round-trips a captured code", () => {
    saveReferralAttribution("K7M2XQ", "LINK");

    expect(readReferralAttribution()).toMatchObject({
      code: "K7M2XQ",
      source: "LINK",
    });
  });

  it("normalises on the way in", () => {
    saveReferralAttribution(" k7m-2xq ", "LINK");
    expect(readReferralAttribution()?.code).toBe("K7M2XQ");
  });

  it("stores nothing for a malformed code", () => {
    expect(saveReferralAttribution("nope", "LINK")).toBeNull();
    expect(readReferralAttribution()).toBeNull();
  });

  it("keeps the first capture when a second link is followed", () => {
    // The parrain who actually brought them here, not whoever was last.
    saveReferralAttribution("K7M2XQ", "LINK");
    const kept = saveReferralAttribution("ZZ99YY", "LINK");

    expect(kept).toBe("K7M2XQ");
    expect(readReferralAttribution()?.code).toBe("K7M2XQ");
  });

  it("expires after the TTL", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    saveReferralAttribution("K7M2XQ", "LINK");

    vi.setSystemTime(new Date("2026-01-31T00:00:01Z")); // 30 days + 1s
    expect(readReferralAttribution()).toBeNull();
    // And cleans up after itself, so it cannot come back.
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it("survives right up to the TTL boundary", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    saveReferralAttribution("K7M2XQ", "LINK");

    vi.setSystemTime(new Date("2026-01-29T00:00:00Z"));
    expect(readReferralAttribution()?.code).toBe("K7M2XQ");
  });

  it("returns null rather than throwing on a corrupt value", () => {
    // Somebody else's key collision, or a half-written value.
    localStorage.setItem(KEY, "{not json");
    expect(readReferralAttribution()).toBeNull();
  });

  it("ignores a stored value whose code is no longer valid", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ code: "BAD", source: "LINK", capturedAt: Date.now() }),
    );
    expect(readReferralAttribution()).toBeNull();
  });

  it("clears on demand, so a shared phone does not attribute the next signup", () => {
    saveReferralAttribution("K7M2XQ", "LINK");
    clearReferralAttribution();
    expect(readReferralAttribution()).toBeNull();
  });

  it("does not throw when storage itself is unavailable", () => {
    // Private mode and "block site data" both throw on access rather than
    // returning null. A signup must survive that.
    Object.defineProperty(globalThis, "localStorage", {
      value: {
        getItem: () => {
          throw new Error("blocked");
        },
        setItem: () => {
          throw new Error("blocked");
        },
        removeItem: () => {
          throw new Error("blocked");
        },
      },
      configurable: true,
      writable: true,
    });

    expect(() => readReferralAttribution()).not.toThrow();
    expect(readReferralAttribution()).toBeNull();
    // Still reports the normalised code, so this visit can use it even though
    // it will not survive to the next one.
    expect(saveReferralAttribution("K7M2XQ", "LINK")).toBe("K7M2XQ");
    expect(() => clearReferralAttribution()).not.toThrow();
  });
});
