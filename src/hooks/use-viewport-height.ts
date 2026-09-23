import { useEffect, useState } from "react";

/**
 * The height of the visual viewport — what is actually visible once the
 * on-screen keyboard has taken its share of the screen.
 *
 * `100dvh` does not shrink for the keyboard on iOS: the layout viewport stays
 * the full height of the screen and the keyboard is drawn over it, so a chat
 * whose composer sits at the bottom of a `h-dvh` column ends up underneath it.
 * Pinning the column to this value instead keeps the composer directly above
 * the keyboard, the way a native app does.
 *
 * Returns `null` where `visualViewport` is missing, so the caller can fall back
 * to its CSS height rather than guess.
 */
export function useViewportHeight(): number | null {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    // `scroll` as well as `resize`: iOS lets the page scroll under the keyboard,
    // and the offset changes without the height doing so.
    const sync = () => setHeight(viewport.height);
    sync();

    viewport.addEventListener("resize", sync);
    viewport.addEventListener("scroll", sync);
    return () => {
      viewport.removeEventListener("resize", sync);
      viewport.removeEventListener("scroll", sync);
    };
  }, []);

  return height;
}
