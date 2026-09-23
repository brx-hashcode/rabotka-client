import { useState } from "react";
import { AlertTriangle, Ban, Check, CheckCheck, Clock, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { discussionsContent } from "@/content/discussions";
import type { DiscussionMessage } from "@/lib/api/discussions-controller";
import { redactionSegments } from "../redaction-segments";
import { SwipeToDelete } from "./swipe-to-delete";

function time(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = Readonly<{
  message: DiscussionMessage;
  /** First of a run from the same sender — only that one gets the tail. */
  firstOfGroup: boolean;
  /** True only under the FIRST hole of the thread — the rule is said once, not per message. */
  showRecipientNotice: boolean;
  onReport: (messageId: string) => void;
  reported: boolean;
  /**
   * Still in flight — the draft, shown the instant it is sent so the thread
   * answers the tap instead of waiting for the round trip. A clock takes the
   * place of the ticks: it says "sending", never "delivered", which is what
   * lets this exist at all (see `useSendMessage`).
   */
  pending?: boolean;
  /** This is the one bubble swiped open. The thread allows one at a time. */
  swipeOpen?: boolean;
  onSwipeOpenChange?: (messageId: string, open: boolean) => void;
  /**
   * Tapping the revealed Supprimer. Absent on a message the server has not
   * acknowledged yet, and never offered on somebody else's.
   */
  onDelete?: (message: DiscussionMessage) => void;
}>;

/**
 * What the AUTHOR sees under a message that did not go through whole: the
 * rule, and a way to contest it. Its own component so the bubble stays about
 * the bubble.
 */
function AuthorNotice({
  held,
  reported,
  onReport,
}: Readonly<{ held: boolean; reported: boolean; onReport: () => void }>) {
  const [confirming, setConfirming] = useState(false);
  const warning = discussionsContent.warning;

  return (
    <div className="mt-1 max-w-[82%] space-y-0.5 text-right">
      <p className="flex items-start justify-end gap-1.5 text-[11px] text-muted-foreground">
        <AlertTriangle className="mt-px h-3 w-3 shrink-0 text-destructive/70" />
        <span>{held ? warning.held : warning.sender}</span>
      </p>

      {reported ? (
        <p className="text-[11px] text-muted-foreground">{warning.reportDone}</p>
      ) : (
        <button
          type="button"
          // Two taps: a report costs a human's attention, and a stray tap on a
          // small link should not spend it.
          onClick={() => (confirming ? onReport() : setConfirming(true))}
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground underline underline-offset-2"
        >
          <Flag className="h-3 w-3" />
          {confirming ? "Confirmer le signalement" : warning.reportCta}
        </button>
      )}
    </div>
  );
}

/**
 * What the bubble actually says — the text, or the fact that there is no
 * longer any text.
 *
 * Its own component so `MessageBubble` stays about the bubble's shape: the
 * redaction splitting and the tombstone are two different renderings of the
 * same slot, and inlining both made one function hard to read.
 */
function BubbleBody({
  message,
  deleted,
}: Readonly<{ message: DiscussionMessage; deleted: boolean }>) {
  if (deleted) {
    // A tombstone, not a gap. The other party keeps seeing that something was
    // there and is gone — a message that simply vanished would read as a bug,
    // and would let a thread be quietly rewritten.
    return (
      <p className="flex items-center gap-1.5 text-[15px] italic leading-snug text-muted-foreground">
        <Ban className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
        {discussionsContent.thread.deleted}
        <span aria-hidden className="inline-block w-9" />
      </p>
    );
  }

  return (
    <p className="whitespace-pre-wrap break-words text-[15px] leading-snug text-foreground">
      {redactionSegments(message.body, message.redactions).map((segment, i) =>
        segment.withheld ? (
          // Readable to its author, struck through IN PLACE — decision 3.1:
          // they must see WHICH of their numbers did not go through.
          <span
            key={i}
            className="rounded bg-destructive/15 px-0.5 line-through decoration-destructive/60"
          >
            {segment.text}
          </span>
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
      <span
        aria-hidden
        className={cn("inline-block", message.mine ? "w-16" : "w-11")}
      />
    </p>
  );
}

export function MessageBubble({
  message,
  firstOfGroup,
  showRecipientNotice,
  onReport,
  reported,
  pending = false,
  swipeOpen = false,
  onSwipeOpenChange,
  onDelete,
}: Props) {
  const warning = discussionsContent.warning;
  const content = discussionsContent.thread;

  const deleted = message.deletedAt !== null;
  const held = message.status === "HELD";
  const hasRedactions = message.redactions.length > 0;
  const mine = message.mine;

  // Yours, still there, and acknowledged by the server. Nothing to delete
  // before it exists or after it is gone.
  const deletable = Boolean(onDelete) && mine && !pending && !deleted;

  return (
    <div
      className={cn(
        "flex w-full flex-col",
        mine ? "items-end" : "items-start",
        // Consecutive messages from one side sit close together, a new speaker
        // gets air above — the grouping that makes a WhatsApp thread scannable.
        // A hairline between grouped bubbles read as one block; `mt-1` separates
        // them without breaking the run.
        firstOfGroup ? "mt-3" : "mt-1",
      )}
    >
      {/* Swipe left to reveal Supprimer. NOT a long press: that is the
          browser's own gesture on a phone — iOS starts selecting text and
          raises its callout — and leaving it alone is also what keeps the
          native "select and copy" working on a message. */}
      <SwipeToDelete
        enabled={deletable}
        isOpen={swipeOpen}
        onOpenChange={(open) => onSwipeOpenChange?.(message.id, open)}
        onDelete={() => onDelete?.(message)}
        label={content.actionsDeleteShort}
      >
        <div
          className={cn(
            "relative max-w-[82%] rounded-lg px-2.5 pb-1.5 pt-1.5 shadow-[0_1px_0.5px_rgb(0_0_0/0.13)]",
            mine ? "bg-chat-bubble-out" : "bg-chat-bubble-in",
            // The tail: the corner nearest the speaker goes square on the first
            // bubble of a group, and a small triangle fills it.
            firstOfGroup && (mine ? "rounded-tr-none" : "rounded-tl-none"),
            (held || pending) && "opacity-70",
            // A tombstone is quieter than the thread around it: it is there to
            // be seen and skipped, not read.
            deleted && "bg-chat-bubble-in/70",
            // Inside the swipe wrapper the bubble is already capped, and a second
            // 82% would compound to 67%.
            deletable && "max-w-full",
          )}
        >
          {firstOfGroup && (
            <span
              aria-hidden
              className={cn(
                "absolute top-0 h-3 w-2",
                mine
                  ? "-right-2 bg-chat-bubble-out [clip-path:polygon(0_0,100%_0,0_100%)]"
                  : "-left-2 bg-chat-bubble-in [clip-path:polygon(0_0,100%_0,100%_100%)]",
              )}
            />
          )}

          {/* The time floats in the last line, WhatsApp-style: a trailing spacer
              reserves its width so a short message stays one line instead of
              dropping the time onto a line of its own. */}
          <BubbleBody message={message} deleted={deleted} />

          <span className="absolute bottom-1 right-2 flex items-center gap-0.5 text-[11px] leading-none text-muted-foreground tabular-nums">
            {time(message.createdAt)}
            {/* Read ticks on the author's side only. Two ticks once the other
                party has opened the thread — `readAt` is set by markRead. A held
                message gets none: it was never delivered, and a tick would say
                otherwise. A message still in flight gets a clock, for the same
                reason, and a deleted one gets neither: there is nothing left for
                a tick to be about. */}
            {mine && pending && <Clock className="h-3 w-3" />}
            {mine &&
              !pending &&
              !held &&
              !deleted &&
              (message.readAt ? (
                <CheckCheck className="h-3.5 w-3.5 text-sky-500" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              ))}
          </span>
        </div>
      </SwipeToDelete>

      {/* No notice under a tombstone: "ce fragment n'a pas été transmis" about
          a message that no longer exists is an explanation of nothing. */}
      {mine && !deleted && (held || hasRedactions) && (
        <AuthorNotice
          held={held}
          reported={reported}
          onReport={() => onReport(message.id)}
        />
      )}

      {!mine && showRecipientNotice && (
        <p className="mt-1 max-w-[82%] text-[11px] text-muted-foreground">
          {warning.recipient}
        </p>
      )}
    </div>
  );
}
