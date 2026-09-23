// @vitest-environment node
// No DOM: the point is what happens when the API is absent or hostile, which
// is most of the platforms this ships to.
import { afterEach, describe, expect, it, vi } from "vitest";

import { tapFeedback } from "@/lib/haptics";

const withNavigator = (value: unknown) => {
  vi.stubGlobal("navigator", value);
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("tapFeedback", () => {
  it("vibrates briefly when the platform supports it", () => {
    const vibrate = vi.fn();
    withNavigator({ vibrate });

    tapFeedback();

    expect(vibrate).toHaveBeenCalledTimes(1);
    // Short enough to read as a tick rather than a buzz.
    expect(vibrate.mock.calls[0][0]).toBeLessThanOrEqual(20);
  });

  it("does nothing on iOS, where navigator.vibrate does not exist", () => {
    // Not a degraded case to fix later — Safari has no vibration API at all,
    // and the press animation is the whole of the feedback there.
    withNavigator({});
    expect(() => tapFeedback()).not.toThrow();
  });

  it("does nothing when there is no navigator at all", () => {
    withNavigator(undefined);
    expect(() => tapFeedback()).not.toThrow();
  });

  it("swallows a rejection from the permissions policy", () => {
    // In a cross-origin iframe, or before any user gesture, browsers reject
    // the call — sometimes by throwing. A tab must still navigate.
    withNavigator({
      vibrate: () => {
        throw new Error("blocked by permissions policy");
      },
    });

    expect(() => tapFeedback()).not.toThrow();
  });
});
