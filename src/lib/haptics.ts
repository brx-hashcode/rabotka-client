/**
 * A short buzz under the thumb, so a tap feels like it landed.
 *
 * WHY HAPTIC AND NOT A SOUND. A notification sound is rare, which is what makes
 * it informative. A tab tap happens dozens of times a session, and a sound on
 * each one stops being feedback and becomes noise — the kind people answer by
 * putting the phone on silent, which then costs the notification sound too.
 * Vibration carries the same "it landed" signal and nobody has ever muted a
 * phone over it.
 *
 * WHAT IT ACTUALLY DOES, HONESTLY:
 *
 * - Android Chrome: works.
 * - iOS Safari: `navigator.vibrate` DOES NOT EXIST. No polyfill, no Web API
 *   equivalent, and the tricks that fake it (a muted <audio> element, a hidden
 *   switch input) are fragile and rejected by App Review when wrapped. iPhone
 *   users get the press animation and nothing more, and that is the honest
 *   state of the platform rather than something to work around.
 * - Desktop: no vibration motor; the call is a silent no-op.
 * - In an iframe without `allow="vibrate"`, or on a page the user has not yet
 *   interacted with, browsers reject the call — sometimes by throwing. Hence
 *   the try/catch: feedback failing must never take a navigation down with it.
 */

/** Long enough to feel, short enough not to buzz. Matches Android's own tick. */
const TAP_MS = 10;

function canVibrate(): boolean {
  return (
    typeof navigator !== "undefined" && typeof navigator.vibrate === "function"
  );
}

/**
 * Feedback for a tap that did something — a tab, a send, a confirm.
 *
 * Fire-and-forget by design: callers never await it and never branch on it.
 */
export function tapFeedback(): void {
  if (!canVibrate()) return;
  try {
    navigator.vibrate(TAP_MS);
  } catch {
    // Blocked by permissions policy, or called before any user gesture.
    // Nothing to report and nothing to retry.
  }
}
