import { analyticsEnabled, trackEvent } from "./gtag";
import { sanitizePath } from "./sanitize-path";

/**
 * Which of the WhatsApp entry points was taken.
 *
 * Named after the audience the link is for, not after the button that carried
 * it — `start` is the header button, which points at the worker link because
 * that is the same entry point.
 */
export type WhatsAppAudience = "worker" | "employer" | "start";

/**
 * The conversion on this site.
 *
 * Every WhatsApp CTA leaves the app for `wa.me`, so there is no landing page on
 * the other side to count and GA cannot infer any of this on its own — an
 * outbound click is the last thing measurable, and it is the thing worth
 * measuring. `placement` is what makes it actionable: it separates the hero
 * from the footer CTA from the header button, which is the question a landing
 * page is actually tuned against.
 *
 * Fired on click rather than on navigation, and nothing is awaited: the
 * browser is already leaving. GA's transport uses `sendBeacon`, which survives
 * the unload, so the event is not lost by not blocking.
 */
export function trackWhatsAppClick(audience: WhatsAppAudience, placement: string): void {
  // Guarded here and not only inside `trackEvent`: the arguments below are
  // evaluated first, and reading `window.location` is work — and a DOM
  // dependency — that a disabled tracker has no business doing.
  if (!analyticsEnabled()) return;
  trackEvent("whatsapp_click", {
    audience,
    placement,
    // The screen the click happened on, sanitised like any other reported
    // path — a CTA can sit on a route that carries a token.
    from_path: sanitizePath(window.location.pathname),
  });
}
