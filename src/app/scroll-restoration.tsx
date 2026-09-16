import { useEffect, useLayoutEffect, useRef } from "react";
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

/**
 * How long to keep trying to reach a saved offset, in animation frames — about
 * two seconds, for a slow WhatsApp webview still fetching the list.
 */
const MAX_RESTORE_FRAMES = 120;

/** Any of these means the user has taken over; restoring must stop. */
const USER_INPUT_EVENTS = ["wheel", "touchstart", "keydown"] as const;

/**
 * Restores scroll position on back/forward, and scrolls to top on a new page.
 *
 * **Positions are recorded as the user scrolls, not when they leave.** The
 * first version saved the outgoing offset in an effect cleanup, which looks
 * right and never works: by the time React runs passive cleanups it has
 * already committed the next page (the document is a different height) and
 * run this component's layout effect, which scrolled to the top. Every list
 * was saved at 0, so going back always landed at the top. Do not move the save
 * back into a cleanup.
 *
 * Attribution relies on ordering: the layout effect switches `activeKey` to
 * the new entry synchronously, while scroll events are dispatched on the next
 * frame. So the clamp caused by the page swap, and our own `scrollTo`, are
 * recorded against the new entry, and the old one keeps the last offset the
 * user actually scrolled to.
 *
 * Restoring is not a single `scrollTo`: on POP the route may be lazy and its
 * data in flight, so the document can still be short and the browser clamps
 * the scroll. We retry across frames until the page is tall enough, and give
 * up as soon as the user starts scrolling themselves.
 */
export function ScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const activeKey = useRef(location.key);

  // We restore by hand, so the browser must not also try — otherwise the two
  // fight and where you land depends on which finished last.
  useEffect(() => {
    if (typeof globalThis.history !== "undefined") {
      globalThis.history.scrollRestoration = "manual";
    }
  }, []);

  // One listener for the app's lifetime; it always writes to whichever entry
  // is current. `pagehide` covers a tab closed before any scroll event fired.
  useEffect(() => {
    const record = () => positions.set(activeKey.current, globalThis.scrollY);
    globalThis.addEventListener("scroll", record, { passive: true });
    globalThis.addEventListener("pagehide", record);
    return () => {
      globalThis.removeEventListener("scroll", record);
      globalThis.removeEventListener("pagehide", record);
    };
  }, []);

  useLayoutEffect(() => {
    // First, before any scrolling below — see the ordering note above.
    activeKey.current = location.key;
    const saved = positions.get(location.key);

    // Anything that is not a back/forward is a new page, and a new page starts
    // at the top — including a PUSH to a route already visited.
    if (navigationType !== "POP" || saved == null || saved === 0) {
      globalThis.scrollTo(0, 0);
      return;
    }

    let frame = 0;
    let raf = 0;
    let stopped = false;

    const stop = () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };

    const attempt = () => {
      if (stopped) return;
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

    for (const type of USER_INPUT_EVENTS) {
      globalThis.addEventListener(type, stop, { passive: true });
    }
    raf = requestAnimationFrame(attempt);

    return () => {
      stop();
      for (const type of USER_INPUT_EVENTS) {
        globalThis.removeEventListener(type, stop);
      }
    };
  }, [location.key, navigationType]);

  return null;
}
