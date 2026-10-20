import { useEffect } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { io } from "socket.io-client";
import { toast } from "sonner";
import {
  clearNotifications,
  dismissNotification,
  getUnreadNotificationsCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
  type NotificationsPage,
} from "@/lib/api/notification-controller";
import { notificationsContent } from "@/content/notifications";
import {
  applyDismiss,
  applyRead,
} from "@/features/notifications/read-state";
import { useProfileMe } from "./use-profile-me";
import {
  playNotificationSound,
  primeNotificationSound,
  shouldChime,
} from "@/lib/notification-sound";

export const notificationsKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationsKeys.all, "list"] as const,
  unreadCount: () => [...notificationsKeys.all, "unread-count"] as const,
};

/** Fallback for sessions where the socket never connects (WhatsApp webview). */
const POLL_INTERVAL = 3 * 60 * 1000;
const PAGE_SIZE = 20;

function useFeedEnabled() {
  const { data: profile } = useProfileMe();
  return profile?.status === "ACTIVE";
}

/** Drives the bell's badge. */
export function useUnreadNotificationsCount() {
  const enabled = useFeedEnabled();

  return useQuery({
    queryKey: notificationsKeys.unreadCount(),
    queryFn: () => getUnreadNotificationsCount(),
    enabled,
    refetchInterval: enabled ? POLL_INTERVAL : false,
    staleTime: 0,
    select: (data: { count: number }) => data.count,
  });
}

export function useNotifications() {
  const enabled = useFeedEnabled();

  return useInfiniteQuery({
    queryKey: notificationsKeys.list(),
    queryFn: ({ pageParam }) => listNotifications(pageParam, PAGE_SIZE),
    enabled,
    staleTime: 0,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((n, p) => n + p.items.length, 0);
      return loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
  });
}

type ListData = InfiniteData<NotificationsPage, number>;

/**
 * Applies a read locally before the server answers, so the dot and the badge
 * clear on tap rather than after a round trip on a slow connection.
 */
function useOptimisticRead() {
  const queryClient = useQueryClient();

  return (isTarget: (id: string) => boolean) => {
    const readAt = new Date().toISOString();
    let cleared = 0;

    queryClient.setQueryData<ListData>(notificationsKeys.list(), (data) => {
      if (!data) return data;
      const result = applyRead(data.pages, isTarget, readAt);
      cleared = result.cleared;
      return { ...data, pages: result.pages };
    });
    queryClient.setQueryData<{ count: number }>(
      notificationsKeys.unreadCount(),
      (data) =>
        data ? { count: Math.max(0, data.count - cleared) } : data,
    );
  };
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const applyRead = useOptimisticRead();

  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onMutate: (id: string) => applyRead((n) => n === id),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const applyRead = useOptimisticRead();

  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onMutate: () => applyRead(() => true),
    onError: () => toast.error(notificationsContent.markAllError),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all }),
  });
}

/** Removes items locally before the server answers — a swiped card is gone. */
function useOptimisticDismiss() {
  const queryClient = useQueryClient();

  return (isTarget: (id: string) => boolean) => {
    let removedUnread = 0;

    queryClient.setQueryData<ListData>(notificationsKeys.list(), (data) => {
      if (!data) return data;
      const result = applyDismiss(data.pages, isTarget);
      removedUnread = result.removedUnread;
      return { ...data, pages: result.pages };
    });
    queryClient.setQueryData<{ count: number }>(
      notificationsKeys.unreadCount(),
      (data) =>
        data ? { count: Math.max(0, data.count - removedUnread) } : data,
    );
  };
}

export function useDismissNotification() {
  const queryClient = useQueryClient();
  const applyDismissLocally = useOptimisticDismiss();

  return useMutation({
    mutationFn: (id: string) => dismissNotification(id),
    onMutate: (id: string) => applyDismissLocally((n) => n === id),
    onError: () => toast.error(notificationsContent.dismissError),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all }),
  });
}

export function useClearNotifications() {
  const queryClient = useQueryClient();
  const applyDismissLocally = useOptimisticDismiss();

  return useMutation({
    mutationFn: () => clearNotifications(),
    onMutate: () => applyDismissLocally(() => true),
    onError: () => toast.error(notificationsContent.clearError),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all }),
  });
}

/**
 * Refetches the feed and badge when the server pushes a new notification. The
 * room is derived server-side from the auth cookie, so there is nothing to emit.
 */
export function useNotificationsSocket(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const socket = io("/notifications", {
      transports: ["websocket"],
      withCredentials: true,
    });

    primeNotificationSound();
    socket.on("notification:new", (notification?: AppNotification) => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
      if (
        shouldChime(
          notification,
          window.location.pathname,
          document.visibilityState === "visible",
        )
      ) {
        playNotificationSound();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [enabled, queryClient]);
}
