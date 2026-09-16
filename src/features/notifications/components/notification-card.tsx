import { useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { Trash2 } from "lucide-react";
import type { AppNotification } from "@/lib/api/notification-controller";
import { notificationsContent as copy } from "@/content/notifications";
import { cn } from "@/lib/utils";
import { NotificationAvatar } from "./notification-avatar";

/** Width of the revealed « Supprimer » button. */
const ACTION_WIDTH = 88;
/** Share of the card width past which letting go deletes outright. */
const FULL_SWIPE_RATIO = 0.6;
/** A flick this fast opens (or closes) the row whatever the distance. */
const FLICK_VELOCITY = 400;
/**
 * The red strip reaches this far under the card, so the card's rounded right
 * corners sit on red rather than on the page while it slides.
 */
const UNDERLAP = 16;

const SPRING = { type: "spring", stiffness: 500, damping: 42 } as const;

function relativeTime(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: fr });
  } catch {
    return "";
  }
}

/**
 * One notification, with WhatsApp's swipe-to-reveal.
 *
 * - A short swipe left snaps the row open on a « Supprimer » button, and it
 *   stays open until the button is tapped, the row is swiped back, the card is
 *   tapped, or another row opens.
 * - A long swipe (past {@link FULL_SWIPE_RATIO} of the width) deletes at once.
 * - At rest the red strip has no width at all, so nothing shows around the
 *   card.
 *
 * `touch-action: pan-y` plus the direction lock keeps a vertical scroll that
 * starts on a card a scroll, rather than a sideways wobble.
 */
export function NotificationCard({
  notification,
  isOpen,
  onOpenChange,
  onOpen,
  onDelete,
}: Readonly<{
  notification: AppNotification;
  /** Whether this row is the one swiped open. The page allows one at a time. */
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOpen: (notification: AppNotification) => void;
  onDelete: (notification: AppNotification) => void;
}>) {
  const rowRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const stripWidth = useTransform(x, (v) => (v < 0 ? -v + UNDERLAP : 0));
  const labelOpacity = useTransform(x, [-ACTION_WIDTH, -ACTION_WIDTH / 2], [1, 0]);
  // A drag ends with a click event on most browsers; this swallows it.
  const dragged = useRef(false);
  const deleting = useRef(false);
  const unread = !notification.readAt;

  // Another row opened, or the page asked this one to close.
  useEffect(() => {
    if (deleting.current) return;
    void animate(x, isOpen ? -ACTION_WIDTH : 0, SPRING);
  }, [isOpen, x]);

  const width = () => rowRef.current?.offsetWidth ?? window.innerWidth;

  const remove = () => {
    if (deleting.current) return;
    deleting.current = true;
    void animate(x, -width(), { duration: 0.2, ease: "easeIn" }).then(() =>
      onDelete(notification),
    );
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const position = x.get();

    if (position < -width() * FULL_SWIPE_RATIO) {
      remove();
    } else {
      const open =
        info.velocity.x < -FLICK_VELOCITY ||
        (info.velocity.x <= FLICK_VELOCITY && position < -ACTION_WIDTH / 2);
      // Re-snap even when the state does not change, or the row would stay
      // wherever the finger left it.
      void animate(x, open ? -ACTION_WIDTH : 0, SPRING);
      onOpenChange(open);
    }

    setTimeout(() => {
      dragged.current = false;
    }, 0);
  };

  return (
    <div ref={rowRef} className="relative overflow-hidden rounded-xl">
      <motion.div
        style={{ width: stripWidth }}
        className="absolute inset-y-0 right-0 flex justify-end overflow-hidden rounded-r-xl bg-destructive"
      >
        <button
          type="button"
          tabIndex={isOpen ? 0 : -1}
          aria-hidden={!isOpen}
          onClick={remove}
          className="flex h-full shrink-0 flex-col items-center justify-center gap-1 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"
          style={{ width: ACTION_WIDTH }}
        >
          <Trash2 className="size-5" />
          <motion.span
            style={{ opacity: labelOpacity }}
            className="text-xs font-medium"
          >
            {copy.delete}
          </motion.span>
        </button>
      </motion.div>

      <motion.button
        type="button"
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -10_000, right: 0 }}
        dragElastic={{ left: 0, right: 0.05 }}
        dragMomentum={false}
        style={{ x, touchAction: "pan-y" }}
        onDragStart={() => {
          dragged.current = true;
        }}
        onDragEnd={handleDragEnd}
        onClick={() => {
          if (dragged.current) return;
          // Like WhatsApp: a tap on an open row just closes it.
          if (isOpen) onOpenChange(false);
          else onOpen(notification);
        }}
        onKeyDown={(e) => {
          if (e.key === "Delete" || e.key === "Backspace") {
            e.preventDefault();
            remove();
          }
        }}
        aria-description={`${copy.delete} : glisser vers la gauche`}
        className={cn(
          // Opaque on purpose: the red strip sits right underneath.
          "relative flex w-full items-start gap-3 rounded-xl bg-card p-4 text-left shadow-soft",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/40",
        )}
      >
        <NotificationAvatar notification={notification} />
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block text-sm leading-tight text-foreground",
              unread ? "font-semibold" : "font-medium",
            )}
          >
            {notification.title}
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">
            {notification.body}
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">
            {relativeTime(notification.createdAt)}
          </span>
        </span>
        {unread && (
          <span
            aria-label="Non lue"
            className="mt-1.5 size-2.5 shrink-0 rounded-full bg-whatsapp"
          />
        )}
      </motion.button>
    </div>
  );
}
