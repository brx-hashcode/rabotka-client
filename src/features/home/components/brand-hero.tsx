import { useEffect, useRef, useState } from "react";
import { onPageScroll, scrollTop } from "@/lib/app-scroll";
import { cn } from "@/lib/utils";

/** The lime as a hex string, for the places CSS variables cannot reach. */
const LIME_HEX = "#CBFFA5";

/**
 * Lime status bar while the hero is on screen. iPhone Safari (26+) tints its
 * bar from the page background and ignores theme-color; Android Chrome reads
 * theme-color. Both are put back on the way out, so other screens keep theirs.
 */
function useLimeChrome() {
  useEffect(() => {
    const root = document.documentElement;
    const previousBackground = root.style.backgroundColor;
    root.style.backgroundColor = LIME_HEX;

    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const previousTheme = meta?.content;
    meta?.setAttribute("content", LIME_HEX);

    return () => {
      root.style.backgroundColor = previousBackground;
      if (meta && previousTheme) meta.setAttribute("content", previousTheme);
    };
  }, []);
}

/** True once the page has scrolled past `ref`'s bottom edge. */
function useScrolledPast(ref: React.RefObject<HTMLElement | null>) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const check = () => {
      const height = ref.current?.offsetHeight ?? 0;
      // A little before the edge, so the compact bar is in place as the
      // band's search pill leaves the screen.
      setPast(height > 0 && scrollTop() > height - 72);
    };
    check();
    return onPageScroll(check);
  }, [ref]);
  return past;
}

type Props = {
  /** First line, e.g. "Bonjour Awa". */
  readonly greeting: React.ReactNode;
  /** The screen's promise, one short line. */
  readonly title: React.ReactNode;
  /** Top-right action (the bell). */
  readonly trailing?: React.ReactNode;
  /** The search pill — shown in the band, and in the compact bar on scroll. */
  readonly search: React.ReactNode;
};

/**
 * The agent app's brand band on a client screen: lime from the status bar
 * down, dark-green ink, a rounded bottom that the next row of cards overlaps
 * (give that row a negative top margin). Scrolled past, a compact lime bar
 * with the same search and action takes over at the top.
 *
 * Built for /home first; any tab screen can use it the same way.
 */
export function BrandHero({ greeting, title, trailing, search }: Props) {
  useLimeChrome();
  const band = useRef<HTMLDivElement>(null);
  const compact = useScrolledPast(band);

  return (
    <>
      {/* Zero-height sticky anchor: the bar hangs from it, so it costs no
          layout space until it slides in. */}
      <div className="sticky top-0 z-40 h-0">
        <div
          aria-hidden={!compact}
          className={cn(
            "absolute inset-x-0 top-0 flex items-center gap-2 bg-lime px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] shadow-soft",
            "transition duration-200 ease-out motion-reduce:transition-none",
            compact
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-full opacity-0",
          )}
        >
          <div className="min-w-0 flex-1">{search}</div>
          {trailing}
        </div>
      </div>

      <div
        ref={band}
        className="rounded-b-[28px] bg-lime px-4 pb-14 pt-[max(1rem,env(safe-area-inset-top))] text-lime-foreground"
      >
        <div className="flex items-start justify-between gap-3 pt-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-lime-muted">{greeting}</p>
            {/* Poppins semibold, not the headings' Gilroy: Gilroy ships only
                ExtraBold, which read too heavy at this size. */}
            <h1 className="mt-0.5 font-[Poppins,sans-serif] text-xl font-semibold leading-tight">
              {title}
            </h1>
          </div>
          {trailing}
        </div>
        <div className="mt-5">{search}</div>
      </div>
    </>
  );
}
