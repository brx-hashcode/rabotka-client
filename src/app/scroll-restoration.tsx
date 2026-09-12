import { useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router";

/**
 * Scroll position per history entry, keyed by `location.key`.
 *
 * A module-level Map rather than sessionStorage: these are only meaningful for
 * history entries that exist in this tab's session, and `location.key` is
 * regenerated on a hard reload anyway — persisting them would just accumulate
 * keys that can never match again.
 */
const positions = new Map<string, number>();

/** How long to keep trying to reach a saved offset, in animation frames. */
const MAX_RESTORE_FRAMES = 60;

/**
 * Restores scroll position on back/forward, and scrolls to top on a new page.
 *
 * The previous version scrolled to top on every pathname change, back included
 * — so opening a job from halfway down the feed and returning dropped you at
 * the top of the list, having lost your place.
 *
 * Restoring is not a single `scrollTo`: on POP the route is lazy, its data is
 * fetched, and the document is still short when this first runs, so the browser
 * clamps the scroll to the current height. We retry across frames until the
 * page is tall enough to honour the offset, then stop.
 */
export function ScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();

  // We restore by hand, so the browser must not also try — otherwise the two
  // fight and where you land depends on which finished last.
  useEffect(() => {
    if (typeof globalThis.history !== "undefined") {
      globalThis.history.scrollRestoration = "manual";
    }
  }, []);

  // Record where this entry was left, so a later POP back to it can return
  // there. Runs on cleanup: at that point the scroll position is still the
  // outgoing page's.
  useEffect(() => {
    const key = location.key;
    const save = () => positions.set(key, globalThis.scrollY);
    globalThis.addEventListener("pagehide", save);
    return () => {
      save();
      globalThis.removeEventListener("pagehide", save);
    };
  }, [location.key]);

  useLayoutEffect(() => {
    const saved = positions.get(location.key);

    // Anything that is not a back/forward is a new page, and a new page starts
    // at the top — including a PUSH to a route already visited.
    if (navigationType !== "POP" || saved == null || saved === 0) {
      globalThis.scrollTo(0, 0);
      return;
    }

    let frame = 0;
    let raf = 0;

    const attempt = () => {
      const maxScroll =
        document.documentElement.scrollHeight - globalThis.innerHeight;

      // Tall enough to honour the offset: land on it and stop.
      if (maxScroll >= saved) {
        globalThis.scrollTo(0, saved);
        return;
      }

      // Not yet — the list is still rendering or its data is still in flight.
      // Go as far as we can so the page is not left at the top if we run out
      // of frames, and try again next frame.
      globalThis.scrollTo(0, Math.max(0, maxScroll));
      frame += 1;
      if (frame < MAX_RESTORE_FRAMES) {
        raf = requestAnimationFrame(attempt);
      }
    };

    raf = requestAnimationFrame(attempt);
    return () => cancelAnimationFrame(raf);
  }, [location.key, navigationType]);

  return null;
}
