// @vitest-environment node
// Pure storage access, no DOM needed — and the shared jsdom environment
// currently fails to load its native `canvas` binding.
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

import { hasWhatsAppOrigin, markWhatsAppOrigin } from "@/lib/whatsapp-origin";

/** Minimal stand-in: the module only ever calls getItem/setItem. */
function fakeStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
  };
}

function useStorage(storage: unknown) {
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
    writable: true,
  });
}

const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

beforeEach(() => {
  useStorage(fakeStorage());
});

afterEach(() => {
  if (original) Object.defineProperty(globalThis, "localStorage", original);
  else Reflect.deleteProperty(globalThis, "localStorage");
});

describe("whatsapp origin", () => {
  it("reads false before any WhatsApp link is followed", () => {
    expect(hasWhatsAppOrigin()).toBe(false);
  });

  it("reads true once the arrival is recorded", () => {
    markWhatsAppOrigin();

    expect(hasWhatsAppOrigin()).toBe(true);
  });

  it("stays true across repeated marks", () => {
    markWhatsAppOrigin();
    markWhatsAppOrigin();

    expect(hasWhatsAppOrigin()).toBe(true);
  });

  it("ignores a value it did not write", () => {
    useStorage({
      getItem: () => "yes",
      setItem: () => undefined,
    });

    expect(hasWhatsAppOrigin()).toBe(false);
  });

  // Safari private mode throws on write, and some webviews disable storage
  // outright. Either must cost the user an explanatory screen, never a crash
  // above the router.
  it("degrades to false when storage throws on read", () => {
    useStorage({
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => undefined,
    });

    expect(hasWhatsAppOrigin()).toBe(false);
  });

  it("swallows a throwing write", () => {
    const setItem = vi.fn(() => {
      throw new Error("QuotaExceededError");
    });
    useStorage({ getItem: () => null, setItem });

    expect(() => markWhatsAppOrigin()).not.toThrow();
    expect(setItem).toHaveBeenCalled();
  });

  it("degrades to false when storage is absent entirely", () => {
    useStorage(undefined);

    expect(hasWhatsAppOrigin()).toBe(false);
    expect(() => markWhatsAppOrigin()).not.toThrow();
  });
});
