/** How much of the card has to be on screen to count as seen. */
export const VISIBLE_RATIO = 0.5;

/** How long it has to stay there — a card swept past is not an impression. */
export const DWELL_MS = 1000;

type Options = {
  /** Called once, when the element has genuinely been looked at. */
  onImpression: () => void;
  /** Guards against counting the same delivery twice. */
  hasCounted: () => boolean;
};

/**
 * Counts an element as seen once it has been on screen long enough.
 *
 * Split out of the hook so the rule itself can be tested: it is what decides
 * whether an advertiser is billed, and getting it wrong is invisible in the UI.
 *
 * Returns a teardown, or null when the environment has no observer — very old
 * Android WebViews. There the ad is simply never counted and comes back next
 * session, which is a better failure than billing an impression nobody saw.
 */
export function observeImpression(
  node: Element,
  { onImpression, hasCounted }: Options,
): (() => void) | null {
  if (typeof IntersectionObserver === "undefined") return null;

  let timer: ReturnType<typeof setTimeout> | undefined;

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries.at(-1);
      if (!entry?.isIntersecting) {
        clearTimeout(timer);
        return;
      }

      timer = setTimeout(() => {
        // Checked here rather than on intersect: a webview minimised on an
        // advert keeps reporting it as visible for as long as it is buried.
        if (document.visibilityState !== "visible") return;
        if (hasCounted()) return;

        onImpression();
        observer.disconnect();
      }, DWELL_MS);
    },
    { threshold: VISIBLE_RATIO },
  );

  observer.observe(node);

  return () => {
    clearTimeout(timer);
    observer.disconnect();
  };
}
