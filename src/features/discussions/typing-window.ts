/**
 * How long a single `typing` event keeps the indicator up.
 *
 * The server relays at most one event every two seconds and the client emits
 * every two and a half, so four seconds covers a missed event without leaving
 * the dots bouncing after somebody has put their phone down. There is no
 * "stopped typing" event to wait for, deliberately: one that never arrives
 * would strand the indicator forever.
 */
export const TYPING_WINDOW_MS = 4_000;

/** The gap the client leaves between two emits while the draft keeps changing. */
export const TYPING_EMIT_INTERVAL_MS = 2_500;

/**
 * Whether the indicator should still be showing.
 *
 * `lastEventAt` is null before the first event ever arrives, and is cleared the
 * moment a message from that person lands — a bubble is proof they have
 * finished, and three dots underneath it would be nonsense.
 */
export function isTypingVisible(
  lastEventAt: number | null,
  now: number,
): boolean {
  if (lastEventAt === null) return false;
  return now - lastEventAt < TYPING_WINDOW_MS;
}

/**
 * Whether enough time has passed to emit again.
 *
 * Keystrokes are not events. Somebody typing a two-line message produces a
 * hundred of them, and this audience pays for the connection by the megabyte.
 */
export function shouldEmitTyping(
  lastEmittedAt: number | null,
  now: number,
): boolean {
  if (lastEmittedAt === null) return true;
  return now - lastEmittedAt >= TYPING_EMIT_INTERVAL_MS;
}
