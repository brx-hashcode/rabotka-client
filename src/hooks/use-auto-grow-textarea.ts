import { useLayoutEffect, useRef } from "react";

/**
 * The height a textarea should take for the content it currently holds, and
 * whether it has to scroll to show the rest.
 *
 * Pure, so it can be tested without a DOM — the measuring is the hook's job.
 */
export function autoGrowHeight(
  scrollHeight: number,
  maxPx: number,
): { height: number; overflows: boolean } {
  return {
    height: Math.min(scrollHeight, maxPx),
    overflows: scrollHeight > maxPx,
  };
}

/**
 * A textarea that grows with its content, up to a ceiling, then scrolls.
 *
 * Measured in JS on purpose. CSS `field-sizing: content` does the same thing in
 * one line, but Safari does not support it, and this app is opened from a
 * WhatsApp link on an iPhone more often than anywhere else: there the box stayed
 * frozen at its min-height and long messages scrolled inside a letterbox.
 *
 * `useLayoutEffect`, not `useEffect`: the resize has to land in the same frame
 * as the keystroke, or the box visibly lags one character behind the text.
 */
export function useAutoGrowTextarea(value: string, maxPx: number) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // `auto` first: `scrollHeight` on an element with an explicit height reports
    // that height, so without this the box can only ever grow.
    el.style.height = "auto";
    const { height, overflows } = autoGrowHeight(el.scrollHeight, maxPx);
    el.style.height = `${height}px`;
    el.style.overflowY = overflows ? "auto" : "hidden";
  }, [value, maxPx]);

  return ref;
}
