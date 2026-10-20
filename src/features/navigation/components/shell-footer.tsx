import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** The slot AppShell renders between the scrolling page and the tab bar. */
export const SHELL_FOOTER_ID = "app-shell-footer";

/**
 * A screen's bottom action, pinned for real: rendered into AppShell's footer
 * slot, outside the scrolling <main>, so it never moves while the page
 * scrolls and the page never shows beneath it.
 *
 * `position: sticky` inside <main> could not do this cleanly — it only sticks
 * within its container, stops at <main>'s 24px bottom padding, and at the end
 * of the page leaves a gap under the button.
 *
 * Renders nothing outside AppShell (or before its slot exists); a screen that
 * may appear elsewhere must not rely on it alone.
 */
export function ShellFooter({ children }: Readonly<{ children: React.ReactNode }>) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setTarget(document.getElementById(SHELL_FOOTER_ID));
  }, []);
  return target ? createPortal(children, target) : null;
}
