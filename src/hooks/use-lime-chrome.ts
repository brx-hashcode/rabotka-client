import { useLayoutEffect } from "react";

/** The lime as a hex string, for the places CSS variables cannot reach. */
const LIME_HEX = "#CBFFA5";

/** The app's defaults, put back when the hero leaves. */
const DEFAULT_THEME_COLOR = "#25D366";

/**
 * Lime status bar while the hero is on screen. iPhone Safari (26+) tints its
 * bar from the page background and ignores theme-color; Android Chrome reads
 * theme-color.
 *
 * A layout effect, so it lands before the first paint of a client-side
 * navigation to home; a full load of /home is covered earlier still by the
 * inline script in index.html. On the way out the defaults are restored —
 * not "what was there", which after that script is already lime.
 */
export function useLimeChrome() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.style.backgroundColor = LIME_HEX;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    meta?.setAttribute("content", LIME_HEX);

    return () => {
      root.style.backgroundColor = "";
      meta?.setAttribute("content", DEFAULT_THEME_COLOR);
    };
  }, []);
}
