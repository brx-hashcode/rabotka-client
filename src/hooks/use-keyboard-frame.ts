import { useEffect, useState } from "react";

/**
 * How much shorter the visible area must be than the page before it counts as
 * a keyboard — more than a browser toolbar collapsing, less than any keyboard.
 */
const KEYBOARD_MIN_PX = 120;

export type KeyboardFrame = { top: number; height: number };

/**
 * The box a full-screen view should occupy while an iPhone keyboard is open,
 * or null when there is none (or nothing to correct).
 *
 * iOS — Safari and the WhatsApp in-app browser alike — does not shrink the
 * page when the keyboard opens: it keeps the layout height and scrolls the
 * document to bring the field into view. An `h-dvh` column then slides up, the
 * header leaves the screen, and the composer floats. The visual viewport is
 * what is actually visible above the keyboard; pinning the view to it — its
 * height AND its offset, which is what an earlier attempt that set the height
 * alone was missing — keeps header and composer where they belong.
 *
 * Android Chrome resizes the page itself (`interactive-widget=resizes-content`
 * in index.html), so there the two heights match and this returns null.
 */
export function keyboardFrame(
  viewport: { height: number; offsetTop: number } | null | undefined,
  layoutHeight: number,
): KeyboardFrame | null {
  if (!viewport) return null;
  if (layoutHeight - viewport.height < KEYBOARD_MIN_PX) return null;
  return {
    top: Math.max(0, Math.round(viewport.offsetTop)),
    height: Math.round(viewport.height),
  };
}

/** `keyboardFrame`, kept current as the keyboard opens, animates and closes. */
export function useKeyboardFrame(): KeyboardFrame | null {
  const [frame, setFrame] = useState<KeyboardFrame | null>(null);

  useEffect(() => {
    const vv = globalThis.visualViewport;
    if (!vv) return;
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const next = keyboardFrame(vv, globalThis.innerHeight);
        setFrame((prev) =>
          prev?.top === next?.top && prev?.height === next?.height ? prev : next,
        );
      });
    };
    update();
    // `scroll` too: iOS moves the visual viewport over the page while typing,
    // without resizing it.
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    globalThis.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      globalThis.removeEventListener("resize", update);
    };
  }, []);

  return frame;
}
