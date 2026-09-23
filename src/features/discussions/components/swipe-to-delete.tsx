import { useEffect, type ReactNode } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { Trash2 } from "lucide-react";

/** Width of the revealed « Supprimer » button. */
const ACTION_WIDTH = 76;
/** A flick this fast opens (or closes) the bubble whatever the distance. */
const FLICK_VELOCITY = 400;
/**
 * The red strip reaches this far under the bubble, so its rounded right corners
 * sit on red rather than on the wallpaper while it slides.
 */
const UNDERLAP = 12;

const SPRING = { type: "spring", stiffness: 500, damping: 42 } as const;

/**
 * Swipe a bubble left to reveal « Supprimer » — the same gesture, spring and
 * constants as `NotificationCard`, so the two feel like one app.
 *
 * SWIPE RATHER THAN LONG PRESS, and that is the whole reason this exists. A
 * long press in a mobile browser is the browser's own gesture: iOS starts
 * selecting text and raises its callout, and no amount of `user-select: none`
 * makes that reliably ours. Leaving the press alone also leaves the native
 * "select and copy", which is a better copy affordance than any button we
 * would draw.
 *
 * Unlike the notification row there is NO full-swipe-to-delete shortcut. That
 * one only clears a row from your own list; this reaches the other person's
 * screen, so it takes a deliberate tap on the button — and the caller then
 * asks for confirmation.
 *
 * `touch-action: pan-y` plus the direction lock keeps a vertical scroll that
 * starts on a bubble a scroll, rather than a sideways wobble.
 */
export function SwipeToDelete({
  enabled,
  isOpen,
  onOpenChange,
  onDelete,
  label,
  children,
}: Readonly<{
  /** False for anything not yours to delete — the bubble then never moves. */
  enabled: boolean;
  /** Whether this bubble is the one swiped open. One at a time, per thread. */
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  label: string;
  children: ReactNode;
}>) {
  const x = useMotionValue(0);
  const stripWidth = useTransform(x, (v) => (v < 0 ? -v + UNDERLAP : 0));

  // Closed by the page when another bubble opens, or when the thread scrolls.
  useEffect(() => {
    if (!enabled) return;
    void animate(x, isOpen ? -ACTION_WIDTH : 0, SPRING);
  }, [enabled, isOpen, x]);

  if (!enabled) return <>{children}</>;

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const position = x.get();
    const open =
      info.velocity.x < -FLICK_VELOCITY ||
      (info.velocity.x <= FLICK_VELOCITY && position < -ACTION_WIDTH / 2);
    // Re-snap even when the state does not change, or the bubble would stay
    // wherever the finger left it.
    void animate(x, open ? -ACTION_WIDTH : 0, SPRING);
    onOpenChange(open);
  };

  return (
    // `-mr-2 pr-2`: the bubble's tail is absolutely positioned 8px OUTSIDE its
    // own box, so a plain `overflow-hidden` would shear it off. Stretching the
    // clip 8px into the gutter instead gives the tail room without moving the
    // bubble — own messages stay exactly where they render without this
    // wrapper, so a pending bubble does not jump 8px when it resolves.
    <div className="relative -mr-2 flex max-w-[82%] justify-end overflow-hidden rounded-lg pr-2">
      <motion.div
        style={{ width: stripWidth }}
        className="absolute inset-y-0 right-0 flex justify-end overflow-hidden rounded-r-lg bg-destructive"
      >
        <button
          type="button"
          tabIndex={isOpen ? 0 : -1}
          aria-hidden={!isOpen}
          onClick={onDelete}
          style={{ width: ACTION_WIDTH }}
          className="flex h-full shrink-0 flex-col items-center justify-center gap-1 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"
        >
          <Trash2 className="size-4" />
          <span className="text-[11px] font-medium">{label}</span>
        </button>
      </motion.div>

      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -ACTION_WIDTH, right: 0 }}
        dragElastic={{ left: 0.05, right: 0.05 }}
        dragMomentum={false}
        style={{ x, touchAction: "pan-y" }}
        onDragEnd={handleDragEnd}
        aria-description={`${label} : glisser vers la gauche`}
        className="min-w-0"
      >
        {children}
      </motion.div>
    </div>
  );
}
