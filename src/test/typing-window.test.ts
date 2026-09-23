// @vitest-environment node
// The timing rules behind the typing indicator — no DOM, no socket.
import { describe, expect, it } from "vitest";

import {
  TYPING_EMIT_INTERVAL_MS,
  TYPING_WINDOW_MS,
  isTypingVisible,
  shouldEmitTyping,
} from "@/features/discussions/typing-window";

const NOW = 1_700_000_000_000;

describe("isTypingVisible", () => {
  it("is hidden before the first event", () => {
    expect(isTypingVisible(null, NOW)).toBe(false);
  });

  it("shows for the length of the window", () => {
    expect(isTypingVisible(NOW, NOW)).toBe(true);
    expect(isTypingVisible(NOW, NOW + TYPING_WINDOW_MS - 1)).toBe(true);
  });

  it("expires on its own, with no 'stopped' event to wait for", () => {
    // The server never sends isTyping:false. One that went missing would leave
    // the dots bouncing for ever.
    expect(isTypingVisible(NOW, NOW + TYPING_WINDOW_MS)).toBe(false);
    expect(isTypingVisible(NOW, NOW + 60_000)).toBe(false);
  });

  it("outlives the gap between two emits, so a steady typist never flickers", () => {
    // The window has to be longer than the client's emit interval, or the dots
    // would blink out between keystrokes.
    expect(TYPING_WINDOW_MS).toBeGreaterThan(TYPING_EMIT_INTERVAL_MS);
    expect(isTypingVisible(NOW, NOW + TYPING_EMIT_INTERVAL_MS)).toBe(true);
  });
});

describe("shouldEmitTyping", () => {
  it("emits on the first keystroke", () => {
    expect(shouldEmitTyping(null, NOW)).toBe(true);
  });

  it("swallows the hundred keystrokes in between", () => {
    expect(shouldEmitTyping(NOW, NOW + 40)).toBe(false);
    expect(shouldEmitTyping(NOW, NOW + TYPING_EMIT_INTERVAL_MS - 1)).toBe(false);
  });

  it("emits again once the interval has passed", () => {
    expect(shouldEmitTyping(NOW, NOW + TYPING_EMIT_INTERVAL_MS)).toBe(true);
  });
});
