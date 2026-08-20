/**
 * Google Analytics 4, loaded from the app rather than from `index.html`.
 *
 * Loading it here and not as a hardcoded snippet in the document head is what
 * makes the measurement id configurable: with `VITE_GA_MEASUREMENT_ID` unset —
 * every dev machine, every preview build, every test run — no script tag is
 * ever injected, no cookie is written and no request leaves the page. A
 * snippet in `index.html` would fire on localhost and pollute the property
 * with development traffic.
 *
 * Two rules the rest of the app depends on:
 *
 * 1. **Consent is denied by default.** `gtag('consent', 'default', …)` is
 *    queued BEFORE the library loads, so GA starts in cookieless mode: it
 *    sends pings that carry no identifier and writes no `_ga` cookie. Traffic
 *    is measurable from the first visit without storing anything on the
 *    device. `grantAnalyticsConsent()` is what a cookie banner would call.
 * 2. **Automatic page views are off.** GA4 fires a `page_view` when it loads
 *    and never again — which in a single-page app means one view per session,
 *    on whichever route the user happened to enter. `send_page_view: false`
 *    plus an explicit call per route change is the standard fix; without the
 *    flag the entry page is counted twice.
 *
 * Nothing here reports a URL. `trackPageView` takes an already-sanitised path
 * from `sanitize-path.ts`, which is a privacy boundary — see the note there.
 */

import { env } from "@/env";

// Through `@/env`, not `import.meta.env`: that module is where this app
// declares and validates its client variables, and it maps an empty string to
// undefined — which is exactly the "configured but blank" case that must count
// as disabled.
const MEASUREMENT_ID = env.VITE_GA_MEASUREMENT_ID ?? "";

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

/**
 * Whether analytics is configured AND able to run here.
 *
 * The window check belongs in this one predicate rather than in `initAnalytics`
 * alone: every function below reaches `window.dataLayer`, so guarding only the
 * loader leaves the reporting calls to throw in any context without a DOM.
 *
 * Everything below is a no-op when this is false, so call sites never have to
 * guard. That is deliberate: a tracking call that throws, or that has to be
 * wrapped in an `if` at every use, is a tracking call somebody eventually
 * removes.
 */
export const analyticsEnabled = (): boolean =>
  Boolean(MEASUREMENT_ID) && typeof window !== "undefined";

/**
 * The canonical gtag shim.
 *
 * It pushes the `arguments` object itself, exactly as Google's own snippet
 * does, rather than a rest parameter collected into an array. The alias below
 * is what gives call sites a real signature — the function deliberately
 * declares no parameters so that `arguments` is what reaches the dataLayer.
 */
function pushCommand(): void {
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

const gtag = pushCommand as (...args: unknown[]) => void;

let started = false;

/**
 * Loads GA and sets the consent baseline. Safe to call more than once.
 */
export function initAnalytics(): void {
  if (started || !analyticsEnabled()) return;
  started = true;

  window.dataLayer = window.dataLayer || [];

  // Queued before the library arrives, so the very first ping is already
  // governed by it. Ads storage is denied and never granted: this property
  // measures a product, it does not build advertising audiences.
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });

  gtag("js", new Date());
  gtag("config", MEASUREMENT_ID, {
    // See the header note: the SPA sends its own, starting with the entry page.
    send_page_view: false,
    // The default would be the real URL, query string and all.
    page_location: window.location.origin,
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  document.head.appendChild(script);
}

/**
 * Reports one screen. `path` must already be sanitised.
 *
 * `page_location` is rebuilt from the origin and the sanitised path instead of
 * being read from `window.location`, so a token in the address bar cannot ride
 * along in the one field that would otherwise carry it.
 */
export function trackPageView(path: string, title?: string): void {
  if (!analyticsEnabled()) return;
  // Idempotent, and cheap once started. Calling it here means no public
  // function can be reached before the dataLayer exists, whatever order a
  // future call site decides to use.
  initAnalytics();
  gtag("event", "page_view", {
    page_path: path,
    page_location: `${window.location.origin}${path}`,
    ...(title ? { page_title: title } : {}),
  });
}

/**
 * Reports a custom event.
 *
 * Parameters are the caller's responsibility, with one standing rule: no phone
 * number, no email, no profile id, no free text a user typed. GA's terms
 * forbid personal data, and this product's users are identified by exactly the
 * fields that would be tempting to send.
 */
export function trackEvent(name: string, params?: Record<string, string | number | boolean>): void {
  if (!analyticsEnabled()) return;
  initAnalytics();
  gtag("event", name, params ?? {});
}

/**
 * Promotes the session from cookieless pings to full measurement.
 *
 * Nothing calls this yet — there is no cookie banner. It exists so that adding
 * one is a UI change and not an analytics rewrite: the banner's «Accepter»
 * handler calls this, and everything else keeps working unchanged.
 */
export function grantAnalyticsConsent(): void {
  if (!analyticsEnabled()) return;
  gtag("consent", "update", { analytics_storage: "granted" });
}

/** The other half of the pair, for a banner's «Refuser» — and for a later opt-out. */
export function revokeAnalyticsConsent(): void {
  if (!analyticsEnabled()) return;
  gtag("consent", "update", { analytics_storage: "denied" });
}
