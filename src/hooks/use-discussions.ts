import { useEffect } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { io } from "socket.io-client";
import {
  hideDiscussion,
  listDiscussionMessages,
  listDiscussions,
  markDiscussionRead,
  reportRedaction,
  sendDiscussionMessage,
} from "@/lib/api/discussions-controller";
import { useProfileMe } from "./use-profile-me";

export const discussionsKeys = {
  all: ["discussions"] as const,
  list: () => [...discussionsKeys.all, "list"] as const,
  thread: (id: string) => [...discussionsKeys.all, "thread", id] as const,
};

/**
 * Fallback for sessions where the socket never connects — the WhatsApp webview
 * being the one that matters here, since that is how a good share of this
 * audience opens the app.
 */
const POLL_INTERVAL = 60 * 1000;

function useMessagingEnabled() {
  const { data: profile } = useProfileMe();
  return Boolean(profile);
}

export function useDiscussions() {
  const enabled = useMessagingEnabled();

  return useQuery({
    queryKey: discussionsKeys.list(),
    // 100, the server's ceiling, because search and the "Non lues" filter run
    // over what is loaded. Nobody here has more conversations than that; if
    // that changes, search moves server-side.
    queryFn: () => listDiscussions(1, 100),
    enabled,
    refetchInterval: enabled ? POLL_INTERVAL : false,
  });
}

/** Drives the badge on the Discussion tab. */
export function useUnreadDiscussionsCount(): number {
  const { data } = useDiscussions();
  return (data?.data ?? []).reduce((sum, d) => sum + d.unreadCount, 0);
}

export function useDiscussionThread(id: string) {
  return useQuery({
    queryKey: discussionsKeys.thread(id),
    queryFn: () => listDiscussionMessages(id),
    enabled: Boolean(id),
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => sendDiscussionMessage(conversationId, body),
    // No optimistic insert, deliberately. The server decides what the message
    // becomes — clean, redacted, or held — and showing the raw text first would
    // flash the author's number on screen as delivered before replacing it.
    // That reads as "it went through, then it didn't".
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: discussionsKeys.thread(conversationId),
      });
      void queryClient.invalidateQueries({ queryKey: discussionsKeys.list() });
    },
  });
}

export function useMarkDiscussionRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markDiscussionRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: discussionsKeys.list() });
      // The bell carries a NEW_MESSAGE row for this conversation; reading the
      // thread is what should clear it.
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useReportRedaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, note }: { messageId: string; note?: string }) =>
      reportRedaction(messageId, note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: discussionsKeys.all });
    },
  });
}

/**
 * Live updates.
 *
 * Listen-only, matching the server: the namespace declares no inbound handler
 * at all, and the room is derived from the auth cookie, so there is nothing to
 * emit. Sending goes over REST, where the message is validated and moderated.
 */
export function useDiscussionsSocket(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const socket = io("/messagerie", {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("message:new", () => {
      void queryClient.invalidateQueries({ queryKey: discussionsKeys.all });
    });

    socket.on("message:read", () => {
      void queryClient.invalidateQueries({ queryKey: discussionsKeys.all });
    });

    return () => {
      socket.disconnect();
    };
  }, [enabled, queryClient]);
}

/**
 * "Supprimer la discussion" for this side.
 *
 * Optimistic: the row leaves the list at once, the way WhatsApp's does, and
 * comes back if the server refuses. Waiting on the round trip would leave a
 * row that was just "deleted" sitting there, which reads as the tap having
 * failed.
 */
export function useHideDiscussion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => hideDiscussion(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: discussionsKeys.list() });
      const previous = queryClient.getQueryData<
        Awaited<ReturnType<typeof listDiscussions>>
      >(discussionsKeys.list());
      if (previous) {
        queryClient.setQueryData(discussionsKeys.list(), {
          ...previous,
          data: previous.data.filter((d) => d.id !== id),
          total: Math.max(0, previous.total - 1),
        });
      }
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(discussionsKeys.list(), context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: discussionsKeys.all });
      // The bell may still carry a NEW_MESSAGE row for this thread.
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
