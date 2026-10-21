/** How far the finger travels before letting go refreshes. */
export const PULL_THRESHOLD = 70;
/** The indicator never comes further down than this. */
const PULL_MAX = 100;

/**
 * Finger travel → how far the indicator moves: half the distance, so it
 * trails the finger like the native gesture, capped at PULL_MAX.
 */
export function pullDistance(dy: number): number {
  if (dy <= 0) return 0;
  return Math.min(PULL_MAX, dy / 2);
}
