/**
 * Where the page scrolls.
 *
 * Every screen inside AppShell or PublicShell scrolls inside their
 * `<main id="app-scroll">`, not the document: the document never scrolls
 * there, so iPhone Safari's toolbar never collapses mid-scroll and nothing
 * (headers, the tab bar, a payment's bottom button) shakes. Only the chats
 * (AppShell `ownsViewport`) and the pages outside both shells (landing, API
 * docs, OAuth consent) still scroll the document.
 *
 * Code that reads or sets the scroll position goes through these helpers so it
 * works on both.
 */
export const APP_SCROLL_ID = "app-scroll";

function scroller(): HTMLElement | null {
  return typeof document === "undefined" ? null : document.getElementById(APP_SCROLL_ID);
}

export function scrollTop(): number {
  const el = scroller();
  return el ? el.scrollTop : globalThis.scrollY;
}

/** How far the current page can scroll. */
export function maxScrollTop(): number {
  const el = scroller();
  return el
    ? el.scrollHeight - el.clientHeight
    : document.documentElement.scrollHeight - globalThis.innerHeight;
}

export function scrollToTop(top = 0, behavior: ScrollBehavior = "auto"): void {
  const el = scroller();
  if (el) el.scrollTo({ top, behavior });
  else globalThis.scrollTo({ top, behavior });
}

/**
 * Calls `onScroll` when the page scrolls, whichever element that is. Scroll
 * events do not bubble, so this listens in the capture phase on the document,
 * which sees the shell's scroller as well as the window. Returns the cleanup.
 */
export function onPageScroll(onScroll: () => void, options: { once?: boolean } = {}): () => void {
  const handler = (event: Event) => {
    const target = event.target;
    if (target !== document && target !== scroller()) return;
    onScroll();
    if (options.once) remove();
  };
  const remove = () => document.removeEventListener("scroll", handler, { capture: true });
  document.addEventListener("scroll", handler, { capture: true, passive: true });
  return remove;
}
