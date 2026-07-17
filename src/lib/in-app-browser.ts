/**
 * Detects in-app browsers (WhatsApp, Facebook, Instagram) — the embedded
 * WebViews that open when a user taps a link inside those apps.
 *
 * Rabotka links reach users through WhatsApp bot templates, so most mobile
 * traffic lands in one of these rather than a real browser. They are severely
 * restricted: no `blob:` downloads, no `window.open`, and on Android the
 * download may be dropped without any error the page can observe. When we
 * cannot guarantee a download works, we point the user at the real browser
 * instead of letting the tap silently do nothing.
 *
 * UA sniffing is a heuristic, not a guarantee — these apps do not expose a
 * reliable capability flag. Treat a positive as "warn the user", never as a
 * reason to block an action outright.
 */

const IN_APP_BROWSER_PATTERNS = [
  /\bWhatsApp\b/i,
  /\bFBAN\b|\bFBAV\b|\bFB_IAB\b/i, // Facebook / Messenger
  /\bInstagram\b/i,
];

export function isInAppBrowser(
  userAgent: string = globalThis.navigator?.userAgent ?? "",
): boolean {
  return IN_APP_BROWSER_PATTERNS.some((pattern) => pattern.test(userAgent));
}
