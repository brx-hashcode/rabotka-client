// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DWELL_MS, observeImpression } from "@/features/sponsored/impression";

/**
 * When an advertisement counts as seen.
 *
 * This rule is what retires a delivery and what an advertiser is billed on, and
 * it is invisible in the UI either way — so it is tested against a fake
 * observer rather than left to manual scrolling.
 */

type Callback = (entries: { isIntersecting: boolean }[]) => void;

let callbacks: Callback[] = [];
let disconnected = 0;

class FakeObserver {
  constructor(private readonly cb: Callback) {
    callbacks.push(cb);
  }
  observe() {}
  disconnect() {
    disconnected += 1;
  }
}

/** Drives the single observer created by the call under test. */
const scroll = (isIntersecting: boolean) =>
  callbacks.at(-1)?.([{ isIntersecting }]);

const node = {} as Element;

beforeEach(() => {
  vi.useFakeTimers();
  callbacks = [];
  disconnected = 0;
  vi.stubGlobal("IntersectionObserver", FakeObserver);
  vi.stubGlobal("document", { visibilityState: "visible" });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("observeImpression()", () => {
  const setup = () => {
    const onImpression = vi.fn();
    let counted = false;
    const stop = observeImpression(node, {
      onImpression: () => {
        counted = true;
        onImpression();
      },
      hasCounted: () => counted,
    });
    return { onImpression, stop };
  };

  it("counts a card that stays on screen", () => {
    const { onImpression } = setup();

    scroll(true);
    vi.advanceTimersByTime(DWELL_MS);

    expect(onImpression).toHaveBeenCalledTimes(1);
  });

  it("does not count a card swept past", () => {
    const { onImpression } = setup();

    scroll(true);
    vi.advanceTimersByTime(DWELL_MS - 1);
    scroll(false);
    vi.advanceTimersByTime(DWELL_MS);

    expect(onImpression).not.toHaveBeenCalled();
  });

  it("does not count a card sitting in a backgrounded app", () => {
    // A minimised webview keeps reporting its content as intersecting.
    const { onImpression } = setup();

    scroll(true);
    vi.stubGlobal("document", { visibilityState: "hidden" });
    vi.advanceTimersByTime(DWELL_MS);

    expect(onImpression).not.toHaveBeenCalled();
  });

  it("counts once, however often the card crosses the threshold", () => {
    const { onImpression } = setup();

    scroll(true);
    vi.advanceTimersByTime(DWELL_MS);
    scroll(false);
    scroll(true);
    vi.advanceTimersByTime(DWELL_MS);

    expect(onImpression).toHaveBeenCalledTimes(1);
  });

  it("stops watching as soon as it has counted", () => {
    setup();

    scroll(true);
    vi.advanceTimersByTime(DWELL_MS);

    expect(disconnected).toBe(1);
  });

  it("drops a pending dwell when the card unmounts", () => {
    const { onImpression, stop } = setup();

    scroll(true);
    stop?.();
    vi.advanceTimersByTime(DWELL_MS);

    expect(onImpression).not.toHaveBeenCalled();
  });

  it("counts nothing where the browser has no observer", () => {
    // Very old Android WebViews. The ad comes back next session instead.
    vi.stubGlobal("IntersectionObserver", undefined);

    expect(observeImpression(node, { onImpression: vi.fn(), hasCounted: () => false })).toBeNull();
  });
});
