import { useCallback, useRef } from "react";

/** WhatsApp's hold is about half a second; shorter fires on slow taps. */
const HOLD_MS = 450;
/** A finger that travels this far is scrolling, not holding. */
const MOVE_TOLERANCE_PX = 10;

/**
 * Long-press on touch, right-click on a mouse — one gesture for "more actions
 * on this row", the way WhatsApp opens its row menu.
 *
 * Returns pointer handlers to spread on the row, plus `consumeClick`: the tap
 * that ENDS a long press must not also open the conversation, so the row's
 * click handler asks this first and bails if the press already fired.
 *
 * Movement cancels the hold. Without it, scrolling the list with a slow thumb
 * pops the menu on whichever row the thumb started on.
 */
export function useLongPress(onLongPress: () => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const fired = useRef(false);

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    start.current = null;
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Right-click is handled by onContextMenu; a mouse press-and-hold on the
      // primary button still counts, for people without a right button.
      if (e.button !== 0) return;
      fired.current = false;
      start.current = { x: e.clientX, y: e.clientY };
      timer.current = setTimeout(() => {
        fired.current = true;
        onLongPress();
      }, HOLD_MS);
    },
    [onLongPress],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!start.current) return;
      const dx = Math.abs(e.clientX - start.current.x);
      const dy = Math.abs(e.clientY - start.current.y);
      if (dx > MOVE_TOLERANCE_PX || dy > MOVE_TOLERANCE_PX) cancel();
    },
    [cancel],
  );

  const onContextMenu = useCallback(
    (e: React.MouseEvent) => {
      // The browser's own menu has nothing useful on a conversation row.
      e.preventDefault();
      fired.current = true;
      onLongPress();
    },
    [onLongPress],
  );

  /** True once, if the click that just happened was the end of a long press. */
  const consumeClick = useCallback(() => {
    const was = fired.current;
    fired.current = false;
    return was;
  }, []);

  return {
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: cancel,
      onPointerLeave: cancel,
      onPointerCancel: cancel,
      onContextMenu,
    },
    consumeClick,
  };
}
