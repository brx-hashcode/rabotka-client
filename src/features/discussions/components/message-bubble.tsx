import { useState } from "react";
import { AlertTriangle, Flag } from "lucide-react";
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

type Props = {
  message: DiscussionMessage;
  /** True only under the FIRST hole of the thread — the rule is said once, not per message. */
  showRecipientNotice: boolean;
  onReport: (messageId: string) => void;
  reported: boolean;
};

export function MessageBubble({
  message,
  showRecipientNotice,
  onReport,
  reported,
}: Props) {
  const [confirming, setConfirming] = useState(false);
  const warning = discussionsContent.warning;

  const held = message.status === "HELD";
  const hasRedactions = message.redactions.length > 0;

  return (
    <div
      className={cn(
        "flex w-full flex-col",
        message.mine ? "items-end" : "items-start",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-3 py-2 shadow-soft",
          message.mine ? "bg-whatsapp/10" : "bg-card",
          // A held message is the author's own text that never left. Muted
          // rather than red: they have not done anything wrong yet, they have
          // been stopped.
          held && "opacity-70",
        )}
      >
        <p className="whitespace-pre-wrap break-words text-sm">
          {redactionSegments(message.body, message.redactions).map((segment, i) =>
            segment.withheld ? (
              // The fragment stays READABLE to its author, struck through in
              // place. That is the whole of decision 3.1: they must see WHICH
              // of their numbers did not go through, not merely that something
              // did not.
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
        </p>

        <span className="mt-1 block text-right text-[10px] text-muted-foreground tabular-nums">
          {time(message.createdAt)}
        </span>
      </div>

      {message.mine && (held || hasRedactions) && (
        <div className="mt-1 max-w-[85%] space-y-1">
          <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <AlertTriangle className="mt-px h-3 w-3 shrink-0 text-destructive/70" />
            <span>{held ? warning.held : warning.sender}</span>
          </p>

          {reported ? (
            <p className="text-[11px] text-muted-foreground">
              {warning.reportDone}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (!confirming) {
                  setConfirming(true);
                  return;
                }
                onReport(message.id);
              }}
              className="flex items-center gap-1 text-[11px] text-muted-foreground underline underline-offset-2"
            >
              <Flag className="h-3 w-3" />
              {confirming ? "Confirmer le signalement" : warning.reportCta}
            </button>
          )}
        </div>
      )}

      {!message.mine && showRecipientNotice && (
        <p className="mt-1 max-w-[85%] text-[11px] text-muted-foreground">
          {warning.recipient}
        </p>
      )}
    </div>
  );
}
