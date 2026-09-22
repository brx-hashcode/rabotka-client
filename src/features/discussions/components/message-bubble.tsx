import { useState } from "react";
import { AlertTriangle, Check, CheckCheck, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { discussionsContent } from "@/content/discussions";
import type { DiscussionMessage } from "@/lib/api/discussions-controller";
import { redactionSegments } from "../redaction-segments";

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

export function MessageBubble({
  message,
  firstOfGroup,
  showRecipientNotice,
  onReport,
  reported,
}: Props) {
  const warning = discussionsContent.warning;

  const held = message.status === "HELD";
  const hasRedactions = message.redactions.length > 0;
  const mine = message.mine;

  return (
    <div
      className={cn(
        "flex w-full flex-col",
        mine ? "items-end" : "items-start",
        // Consecutive messages from one side sit close together, a new speaker
        // gets air above — the grouping that makes a WhatsApp thread scannable.
        firstOfGroup ? "mt-2" : "mt-0.5",
      )}
    >
      <div
        className={cn(
          "relative max-w-[82%] rounded-lg px-2.5 pb-1.5 pt-1.5 shadow-[0_1px_0.5px_rgb(0_0_0/0.13)]",
          mine ? "bg-chat-bubble-out" : "bg-chat-bubble-in",
          // The tail: the corner nearest the speaker goes square on the first
          // bubble of a group, and a small triangle fills it.
          firstOfGroup && (mine ? "rounded-tr-none" : "rounded-tl-none"),
          held && "opacity-70",
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
          <span aria-hidden className={cn("inline-block", mine ? "w-16" : "w-11")} />
        </p>

        <span className="absolute bottom-1 right-2 flex items-center gap-0.5 text-[11px] leading-none text-muted-foreground tabular-nums">
          {time(message.createdAt)}
          {/* Read ticks on the author's side only. Two ticks once the other
              party has opened the thread — `readAt` is set by markRead. A held
              message gets none: it was never delivered, and a tick would say
              otherwise. */}
          {mine &&
            !held &&
            (message.readAt ? (
              <CheckCheck className="h-3.5 w-3.5 text-sky-500" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            ))}
        </span>
      </div>

      {mine && (held || hasRedactions) && (
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
