import { useEffect } from "react";
import { useLocation } from "react-router";

import { initAnalytics, trackPageView } from "./gtag";
import { sanitizePath } from "./sanitize-path";

/**
 * Reports a page view on every route change.
 *
 * Must be rendered inside the router — it reads `useLocation`. GA4 counts a
 * page view only when its library first loads, so in a single-page app every
 * navigation after the first is invisible without this hook.
 *
 * Keyed on `pathname` alone, not on the whole location: a change of query
 * string or hash is not a new screen. The search filters write to the query
 * string through nuqs on every keystroke, and counting those as page views
 * would bury the report under a screen nobody navigated to.
 */
export function usePageTracking(): void {
  const { pathname } = useLocation();

  useEffect(() => {
    initAnalytics();
    const path = sanitizePath(pathname);

    // Deferred by a turn of the event loop so the title is the new page's.
    // `react-helmet-async` writes `document.title` from its own effect, and
    // effect order between it and this hook is not guaranteed — reporting
    // synchronously here labels each screen with the title of the previous
    // one, which is the kind of wrong that looks plausible in a report.
    const timer = setTimeout(() => trackPageView(path, document.title), 0);
    return () => clearTimeout(timer);
  }, [pathname]);
}
