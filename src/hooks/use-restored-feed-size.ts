import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A feed's «Voir plus» size, remembered across a detail-page round trip.
 *
 * Ordinary `useState` resets when the component unmounts, so opening a job
 * from the fifth page of the feed and coming back rebuilt it at one page —
 * losing both the list and, because the page is then far shorter, any hope of
 * restoring the scroll position on top of it.
 *
 * sessionStorage rather than a module variable: it survives the reload that
 * `error-boundary` performs, and it is scoped to the tab, so two tabs on the
 * same feed do not tug each other's list length around.
 *
 * The size is deliberately NOT put in the URL. It is a scroll-depth detail
 * rather than something worth sharing, and a link that reopened someone else's
 * fifth page would be slower to load for no benefit to whoever received it.
 */
export function useRestoredFeedSize(
  storageKey: string,
  initialSize: number,
): [number, (next: number | ((current: number) => number)) => void, () => void] {
  const [size, setSize] = useState(() => read(storageKey, initialSize));

  // Written on change rather than on unmount: a tab closed or crashed mid-feed
  // still comes back where it was.
  useEffect(() => {
    write(storageKey, size);
  }, [storageKey, size]);

  const initial = useRef(initialSize);
  initial.current = initialSize;

  const reset = useCallback(() => {
    setSize(initial.current);
    write(storageKey, initial.current);
  }, [storageKey]);

  return [size, setSize, reset];
}

function read(key: string, fallback: number): number {
  try {
    const raw = globalThis.sessionStorage?.getItem(key);
    if (raw == null) return fallback;
    const parsed = Number.parseInt(raw, 10);
    // Never below the initial size: a stored 0 or a hand-edited value would
    // render an empty feed with a «Voir plus» button as the only way out.
    return Number.isFinite(parsed) && parsed >= fallback ? parsed : fallback;
  } catch {
    // Private browsing and blocked site data both throw here. The feed works
    // without the memory; it just starts at the top, as it always did.
    return fallback;
  }
}

function write(key: string, value: number): void {
  try {
    globalThis.sessionStorage?.setItem(key, String(value));
  } catch {
    // Ignored for the same reason as above.
  }
}
