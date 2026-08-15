/**
 * Remembers that this browser once redeemed a WhatsApp login code.
 *
 * The signal a "was this opened from WhatsApp?" question really needs is
 * provenance, not the User-Agent. `isInAppBrowser` cannot answer it: WhatsApp's
 * iOS webview presents a plain Safari string with no WhatsApp token, so UA
 * matching would treat every iPhone as a browser — which is why that module's
 * own header says never to block on it.
 *
 * `localStorage` is the right store precisely because it is per browser
 * profile. WhatsApp's webview keeps its own; Chrome cannot see what was written
 * there, which is exactly the distinction being drawn.
 */

const ORIGIN_KEY = "rabotka.whatsapp-origin";

/** Records that the session was bootstrapped from a WhatsApp link. */
export function markWhatsAppOrigin(): void {
  try {
    globalThis.localStorage?.setItem(ORIGIN_KEY, "1");
  } catch {
    // Safari private mode throws on write, and some webviews disable storage
    // outright. Losing the mark costs the user one explanatory screen; letting
    // the throw escape would take down everything above the router.
  }
}

/** Whether a WhatsApp link ever signed this browser in. */
export function hasWhatsAppOrigin(): boolean {
  try {
    return globalThis.localStorage?.getItem(ORIGIN_KEY) === "1";
  } catch {
    return false;
  }
}
