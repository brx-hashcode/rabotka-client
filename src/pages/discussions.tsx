import { useNavigate } from "react-router";
import { MessagesSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScreenHeader } from "@/features/employer";
import { discussionsContent } from "@/content/discussions";
import {
  useDiscussions,
  useDiscussionsSocket,
} from "@/hooks/use-discussions";

function when(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay
    ? date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
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

      <div className="flex w-full flex-1 flex-col space-y-3 px-4 pb-8 pt-4">
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        )}

        {!isLoading && discussions.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-muted p-6">
              <MessagesSquare className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="mb-1 text-lg font-semibold">{content.emptyTitle}</p>
            <p className="max-w-sm text-muted-foreground">
              {content.emptyDescription}
            </p>
          </div>
        )}

        {discussions.map((discussion) => (
          <button
            key={discussion.id}
            type="button"
            onClick={() => navigate(`/discussions/${discussion.id}`)}
            className="w-full rounded-lg bg-card px-4 py-3 text-left shadow-soft transition-opacity active:opacity-80"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate font-semibold">
                {discussion.counterpartName}
              </span>
              <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                {when(discussion.lastMessageAt)}
              </span>
            </div>

            {discussion.jobTitle && (
              <p className="truncate text-xs text-muted-foreground">
                {discussion.jobTitle}
              </p>
            )}

            <div className="mt-1 flex items-center justify-between gap-2">
              {/* Already redacted server-side when the last message was not
                  this profile's. A preview is a message too, and a leak in a
                  list is still a leak. */}
              <p className="truncate text-sm text-muted-foreground">
                {discussion.closed
                  ? content.closed
                  : (discussion.lastMessagePreview ?? "")}
              </p>

              {discussion.unreadCount > 0 && (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-whatsapp px-1.5 text-[11px] font-semibold text-white tabular-nums">
                  {discussion.unreadCount > 9 ? "9+" : discussion.unreadCount}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
