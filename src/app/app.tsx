import { useEffect, type ReactNode } from "react";
import { BrowserRouter, useLocation } from "react-router";
import { Providers } from "./providers";
import { AppRoutes } from "./routes";
import {
  ErrorBoundary,
  clearChunkReloadGuard,
} from "@/components/common/error-boundary";
import { usePageTracking } from "@/lib/analytics/use-page-tracking";
import { useReferralCapture } from "@/hooks/use-referral-capture";

/** How long the app must run cleanly before the reload guard is released. */
const GUARD_RESET_DELAY_MS = 10_000;

/**
 * Releases the one-shot reload guard, but only after the app has run for a
 * while without failing.
 *
 * Clearing it on mount would be a reload loop: App mounts *before* a lazy route
 * resolves, so a chunk that keeps 404ing would clear the guard, throw, reload,
 * and repeat. Waiting means a genuinely broken chunk still throws while the
 * guard is set — showing the retry screen — while a healthy session regains
 * automatic recovery for a stale chunk encountered later.
 */
function ChunkGuardReset() {
  useEffect(() => {
    const timer = setTimeout(clearChunkReloadGuard, GUARD_RESET_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);
  return null;
}

/**
 * Reports each route change to Analytics. Renders nothing, and does nothing at
 * all when `VITE_GA_MEASUREMENT_ID` is unset. Must sit inside `BrowserRouter`.
 */
function AnalyticsTracker() {
  usePageTracking();
  return null;
}

/**
 * Stores a `?ref=` parrainage code so it survives the walk from the landing
 * page to the confirmation screen. Renders nothing. Must sit inside
 * `BrowserRouter`, and must be here rather than on the signup page — the link
 * lands on the landing page, not on `/onboarding`.
 */
function ReferralCapture() {
  useReferralCapture();
  return null;
}

/**
 * A second boundary, inside the router, that clears itself on navigation.
 *
 * With only the outer one, a page that throws took the whole app with it and
 * the way out was a full reload. Keyed on the pathname, leaving the broken
 * page — back, a tab, a link — renders the next one normally. The outer
 * boundary stays for what fails outside the routes.
 */
function RouteErrorBoundary({ children }: Readonly<{ children: ReactNode }>) {
  const { pathname } = useLocation();
  return <ErrorBoundary resetKey={pathname}>{children}</ErrorBoundary>;
}

/*
 * The boundary sits inside Providers and around the router: a failed lazy
 * chunk (every route is lazy, and a deploy renames them) would otherwise
 * unmount the tree and leave a blank page that only a manual reload clears.
 */
const App = () => (
  <Providers>
    <ErrorBoundary>
      <BrowserRouter>
        <ChunkGuardReset />
        <AnalyticsTracker />
        <ReferralCapture />
        <RouteErrorBoundary>
          <AppRoutes />
        </RouteErrorBoundary>
      </BrowserRouter>
    </ErrorBoundary>
  </Providers>
);

export default App;
