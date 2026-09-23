import { AlertTriangle, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { tapFeedback } from "@/lib/haptics";
import type { Discussion } from "@/lib/api/discussions-controller";
import { discussionsContent } from "@/content/discussions";
import { CounterpartAvatar } from "./counterpart-avatar";
import { useLongPress } from "../use-long-press";
import { listTime } from "../list-time";

type Props = Readonly<{
  discussion: Discussion;
  onOpen: () => void;
  onActions: () => void;
}>;

export function DiscussionRow({ discussion, onOpen, onActions }: Props) {
  const unread = discussion.unreadCount > 0;
  const content = discussionsContent.list;
  const { handlers, consumeClick } = useLongPress(() => {
    tapFeedback();
    onActions();
  });

  const preview = discussion.closed
    ? content.closed
    : discussion.lastMessagePreview || discussion.jobTitle || "";

  return (
    <li className="group relative">
      <button
        type="button"
        {...handlers}
        onClick={() => {
          if (consumeClick()) return;
          tapFeedback();
          onOpen();
        }}
        // No text selection on hold: on iOS a long press otherwise selects the
        // name before our menu gets the chance to open.
        className="flex w-full select-none items-center gap-3 px-4 py-2.5 text-left transition-colors [-webkit-touch-callout:none] active:bg-muted/70"
      >
        <CounterpartAvatar
          name={discussion.counterpartName}
          avatarUrl={discussion.counterpartAvatarUrl}
          online={discussion.counterpartOnline}
          className="h-[52px] w-[52px]"
        />

        <div className="min-w-0 flex-1 py-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[16px] font-semibold text-foreground">
              {discussion.counterpartName}
            </span>
            {/* Green when something is unread — the time is where the eye lands
                first in a row, so it doubles as the signal. */}
            <span
              className={cn(
                "shrink-0 text-xs tabular-nums",
                unread ? "font-semibold text-whatsapp" : "text-muted-foreground",
              )}
            >
              {listTime(discussion.lastMessageAt)}
            </span>
          </div>

          <div className="mt-0.5 flex items-center justify-between gap-2">
            <p
              className={cn(
                "flex min-w-0 items-center gap-1 text-[14px]",
                unread ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {/* The viewer's own last message, marked the WhatsApp way. This is
                  also what tells them a number shown in clear here is THEIR
                  text — the author sees what they typed — and not a leak. */}
              {discussion.lastMessageMine &&
                !discussion.closed &&
                (discussion.lastMessageHeld ? (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-destructive/70" />
                ) : discussion.lastMessageRead ? (
                  <CheckCheck className="h-4 w-4 shrink-0 text-sky-500" />
                ) : (
                  <Check className="h-4 w-4 shrink-0" />
                ))}
              <span className="truncate">{preview}</span>
            </p>

            {unread && (
              <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-whatsapp px-1.5 text-[11px] font-semibold text-white tabular-nums">
                {discussion.unreadCount > 99 ? "99+" : discussion.unreadCount}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* The separator, inset to start under the text rather than under the
          avatar — WhatsApp's hairline. A line, not a border on a card: the rows
          stay flat. Hidden after the last row. */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-[80px] right-0 h-px bg-border/70 group-last:hidden"
      />
    </li>
  );
}
