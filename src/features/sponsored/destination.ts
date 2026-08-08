/**
 * Whether the destination goes through the `/r/:hash` redirect.
 *
 * That hop is what records the click server-side, and it marks the delivery
 * seen on the way through — so a tracked URL needs no local bookkeeping, while
 * a raw fallback URL does.
 *
 * Matched on the path only: an advertiser URL is free to carry `/r/` inside a
 * query string without that making it one of ours.
 */
export function isTrackedAdUrl(ctaUrl: string): boolean {
  try {
    return new URL(ctaUrl, globalThis.location?.origin).pathname.startsWith(
      "/r/",
    );
  } catch {
    return false;
  }
}

/**
 * Sends the reader to the advertiser.
 *
 * Same tab, not window.open: most traffic lands in the WhatsApp/Facebook
 * WebView, which silently swallows popups (see lib/in-app-browser). The
 * /r/:hash hop records the click and marks the delivery seen server-side, so
 * there is no impression to fire here — for an untracked fallback URL we still
 * mark it, since nothing else will.
 */
export function openAdDestination(ctaUrl: string, markSeen: () => void): void {
  if (!isTrackedAdUrl(ctaUrl)) markSeen();
  globalThis.location.assign(ctaUrl);
}
