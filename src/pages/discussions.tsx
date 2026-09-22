import { useNavigate } from "react-router";
import { MessagesSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScreenHeader } from "@/features/employer";
import { discussionsContent } from "@/content/discussions";
import { CounterpartAvatar } from "@/features/discussions/components/counterpart-avatar";
import { tapFeedback } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import {
  useDiscussions,
  useDiscussionsSocket,
} from "@/hooks/use-discussions";

/**
 * WhatsApp's rule, because it is the one this audience already reads without
 * thinking: the time today, "Hier" yesterday, the weekday within the week, a
 * date beyond that.
 */
function when(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.floor(
    (startOfToday.getTime() -
      new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) /
      86_400_000,
  );

  if (days <= 0)
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (days === 1) return "Hier";
  if (days < 7) return date.toLocaleDateString("fr-FR", { weekday: "long" });
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export default function Discussions() {
  const navigate = useNavigate();
  const { data, isLoading } = useDiscussions();
  useDiscussionsSocket(true);

  const content = discussionsContent.list;
  const discussions = data?.data ?? [];

  return (
    <div className="flex min-h-screen flex-col">
      <ScreenHeader title={content.title} />

      {isLoading && (
        <div className="space-y-1 px-4 pt-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && discussions.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-6">
            <MessagesSquare className="h-12 w-12 text-muted-foreground" />
          </div>
          <p className="mb-1 text-lg font-semibold">{content.emptyTitle}</p>
          <p className="max-w-sm text-muted-foreground">
            {content.emptyDescription}
          </p>
        </div>
      )}

      {/* Flat rows, not cards — the WhatsApp list. A card per conversation
          spends a third of every row on padding and shadow and fits half as
          many threads on the screen, which is the one thing a list is for. */}
      <ul className="pb-8 pt-1">
        {discussions.map((discussion) => {
          const unread = discussion.unreadCount > 0;
          return (
            <li key={discussion.id}>
              <button
                type="button"
                onClick={() => {
                  tapFeedback();
                  navigate(`/discussions/${discussion.id}`);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors active:bg-muted/70"
              >
                <CounterpartAvatar
                  name={discussion.counterpartName}
                  avatarUrl={discussion.counterpartAvatarUrl}
                  online={discussion.counterpartOnline}
                  className="h-12 w-12"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[15px] font-semibold text-foreground">
                      {discussion.counterpartName}
                    </span>
                    {/* Green when there is something unread, like WhatsApp:
                        the time is the first thing the eye lands on in a row,
                        so it doubles as the signal. */}
                    <span
                      className={cn(
                        "shrink-0 text-xs tabular-nums",
                        unread ? "font-semibold text-whatsapp" : "text-muted-foreground",
                      )}
                    >
                      {when(discussion.lastMessageAt)}
                    </span>
                  </div>

                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    {/* Already redacted server-side when the last message was
                        not this profile's. A preview is a message too, and a
                        leak in a list is still a leak. */}
                    <p
                      className={cn(
                        "truncate text-sm",
                        unread ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {discussion.closed
                        ? content.closed
                        : discussion.lastMessagePreview ||
                          discussion.jobTitle ||
                          ""}
                    </p>

                    {unread && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-whatsapp px-1.5 text-[11px] font-semibold text-white tabular-nums">
                        {discussion.unreadCount > 99 ? "99+" : discussion.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
