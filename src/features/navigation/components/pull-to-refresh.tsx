import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { PULL_THRESHOLD, pullDistance } from "@/lib/pull-distance";


/**
 * Pull down at the top of a tab screen to reload what it shows.
 *
 * The shell's <main> is the scroller, not the document, so the browser's own
 * pull-to-refresh never fires — and in the installed app or the WhatsApp
 * webview there is none at all. Refetching the active queries rather than
 * reloading the page keeps what is on screen until the new data lands, and
 * works offline-first: a failed refetch leaves the stored data in place.
 */
export function PullToRefresh({ scrollerId }: Readonly<{ scrollerId: string }>) {
  const queryClient = useQueryClient();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);

  useEffect(() => {
    const scroller = document.getElementById(scrollerId);
    if (!scroller) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;
    let current = 0;

    const onStart = (e: TouchEvent) => {
      // Only from the very top, one finger, and not mid-refresh.
      tracking =
        scroller.scrollTop <= 0 &&
        e.touches.length === 1 &&
        !refreshingRef.current;
      if (!tracking) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      current = 0;
    };

    const onMove = (e: TouchEvent) => {
      if (!tracking) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      // A sideways swipe (the home rails, the category chips) is not a pull;
      // nor is anything once the list has started scrolling.
      if (Math.abs(dx) > Math.abs(dy) || scroller.scrollTop > 0) {
        tracking = false;
        current = 0;
        setPull(0);
        return;
      }
      current = pullDistance(dy);
      setPull(current);
    };

    const onEnd = () => {
      if (!tracking) return;
      tracking = false;
      if (current * 2 < PULL_THRESHOLD) {
        setPull(0);
        return;
      }
      refreshingRef.current = true;
      setRefreshing(true);
      setPull(PULL_THRESHOLD / 2);
      void queryClient
        .refetchQueries({ type: "active" })
        .catch(() => undefined)
        .finally(() => {
          refreshingRef.current = false;
          setRefreshing(false);
          setPull(0);
        });
    };

    // Passive: the gesture is only observed, never blocks scrolling.
    scroller.addEventListener("touchstart", onStart, { passive: true });
    scroller.addEventListener("touchmove", onMove, { passive: true });
    scroller.addEventListener("touchend", onEnd);
    scroller.addEventListener("touchcancel", onEnd);
    return () => {
      scroller.removeEventListener("touchstart", onStart);
      scroller.removeEventListener("touchmove", onMove);
      scroller.removeEventListener("touchend", onEnd);
      scroller.removeEventListener("touchcancel", onEnd);
    };
  }, [scrollerId, queryClient]);

  if (pull === 0 && !refreshing) return null;

  const armed = pull * 2 >= PULL_THRESHOLD;
  return (
    <div
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 top-[env(safe-area-inset-top)] z-30 flex justify-center"
      style={{ transform: `translateY(${pull - 8}px)` }}
    >
      <span className="sr-only">{refreshing ? "Actualisation…" : ""}</span>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-soft">
        <RefreshCw
          className={cn(
            "h-4 w-4 transition-colors",
            armed || refreshing ? "text-primary" : "text-muted-foreground",
            refreshing && "animate-spin motion-reduce:animate-none",
          )}
          // Turns with the pull, so it reads as "keep going" until armed.
          style={refreshing ? undefined : { transform: `rotate(${pull * 3.6}deg)` }}
        />
      </div>
    </div>
  );
}
