import { useEffect } from "react";
import { BrowserRouter } from "react-router";
import { Providers } from "./providers";
import { AppRoutes } from "./routes";
import { AdPopup } from "@/features/ads/ad-popup";
import {
  ErrorBoundary,
  clearChunkReloadGuard,
} from "@/components/common/error-boundary";

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
        <AppRoutes />
        {/* Rides along on every route — it picks its own moments to appear. */}
        <AdPopup />
      </BrowserRouter>
    </ErrorBoundary>
  </Providers>
);

export default App;
