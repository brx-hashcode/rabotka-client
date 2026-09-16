import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { BellOff, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryErrorState } from "@/components/common/query-error-state";
import { Seo } from "@/hooks/use-seo";
import { useGoBack } from "@/hooks/use-go-back";
import { ScreenHeader } from "@/features/employer";
import {
  useClearNotifications,
  useDismissNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/use-notifications";
import type { AppNotification } from "@/lib/api/notification-controller";
import { notificationsContent as copy } from "@/content/notifications";
import { NotificationCard } from "@/features/notifications/components/notification-card";
import { NotificationActionsSheet } from "@/features/notifications/components/notification-actions-sheet";
import { groupNotificationsByDay } from "@/features/notifications/read-state";

export default function Notifications() {
  const navigate = useNavigate();
  const goBack = useGoBack("/home");
  const [menuOpen, setMenuOpen] = useState(false);
  // The row swiped open, if any — one at a time, as on WhatsApp.
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const dismiss = useDismissNotification();
  const clearAll = useClearNotifications();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Scrolling the list closes an open row, as it does on WhatsApp.
  useEffect(() => {
    if (!openRowId) return;
    const close = () => setOpenRowId(null);
    window.addEventListener("scroll", close, { passive: true, once: true });
    return () => window.removeEventListener("scroll", close);
  }, [openRowId]);

  const notifications = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  );
  const sections = useMemo(
    () => groupNotificationsByDay(notifications),
    [notifications],
  );
  const hasUnread = notifications.some((n) => !n.readAt);

  const open = (notification: AppNotification) => {
    if (!notification.readAt) markRead.mutate(notification.id);
    if (notification.link) navigate(notification.link);
  };

  return (
    <>
      <Seo
        title="Notifications - Rabotka"
        description={copy.seoDescription}
        canonical="/notifications"
        noIndex
      />
      <div className="flex min-h-screen flex-col">
        <ScreenHeader
          title={copy.title}
          onBack={goBack}
          action={
            notifications.length > 0 && (
              <button
                type="button"
                aria-label={copy.menuLabel}
                onClick={() => setMenuOpen(true)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/40"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            )
          }
        />

        {isLoading && (
          <div className="space-y-3 px-4 py-4">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        )}

        {!isLoading && isError && (
          <QueryErrorState
            className="flex-1"
            message={copy.loadError}
            onRetry={refetch}
            isRetrying={isFetching}
          />
        )}

        {!isLoading && !isError && notifications.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-20 text-center">
            <span className="flex size-20 items-center justify-center rounded-full bg-secondary">
              <BellOff className="size-9 text-muted-foreground" />
            </span>
            <p className="max-w-xs text-sm text-muted-foreground">
              {copy.empty}
            </p>
          </div>
        )}

        {notifications.length > 0 && (
          <div className="space-y-5 px-4 py-4">
            {sections.map((section) => (
              <section key={section.bucket} aria-label={section.label}>
                <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {section.label}
                </h2>
                <div className="space-y-3">
                  {section.items.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      isOpen={openRowId === notification.id}
                      onOpenChange={(isOpen) =>
                        setOpenRowId((current) =>
                          isOpen
                            ? notification.id
                            : current === notification.id
                              ? null
                              : current,
                        )
                      }
                      onOpen={open}
                      onDelete={(n) => {
                        setOpenRowId(null);
                        dismiss.mutate(n.id);
                      }}
                    />
                  ))}
                </div>
              </section>
            ))}
            {hasNextPage && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {copy.loadMore}
              </Button>
            )}
          </div>
        )}
      </div>

      <NotificationActionsSheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        hasUnread={hasUnread}
        hasItems={notifications.length > 0}
        onMarkAllRead={() => markAllRead.mutate()}
        onClearAll={() => clearAll.mutate()}
      />
    </>
  );
}
