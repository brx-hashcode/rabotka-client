import { useEffect } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  acquireDiscussionSocket,
  releaseDiscussionSocket,
} from "@/features/discussions/discussion-socket";
import {
  deleteDiscussionMessage,
  getDiscussion,
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
  one: (id: string) => [...discussionsKeys.all, "one", id] as const,
  /**
   * DELIBERATELY OUTSIDE `all`.
   *
   * The socket invalidates `all` on every message that arrives, which is right
   * for the list and the live page and wrong for history: a message already
   * sent does not change, and somebody who had opened five pages of it would
   * refetch all five each time the other party typed a line.
   *
   * The cost is that ticks on history go stale while the screen stays open —
   * an old message of yours that the other side reads just now keeps one tick
   * until the history is fetched again. A tick on a message from last week,
   * against five refetches a minute.
   */
  history: (id: string) => ["discussions-history", id] as const,
};

/**
 * Fallback for sessions where the socket never connects — the WhatsApp webview
 * being the one that matters here, since that is how a good share of this
 * audience opens the app.
 */
const POLL_INTERVAL = 60 * 1000;

/**
 * Faster for the thread that is open, because that is the screen where a
 * missing message reads as the app being broken rather than as being a minute
 * behind. React Query pauses an interval while the tab is in the background
 * (`refetchIntervalInBackground` defaults to false), so this costs nothing on a
 * screen nobody is looking at.
 */
const THREAD_POLL_INTERVAL = 15 * 1000;

/** The live page, and where history picks up: message 51 and older. */
export const THREAD_PAGE_SIZE = 50;

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

/**
 * The header of one thread — counterpart, job, presence.
 *
 * Its own request rather than a lookup in the list: the list only holds threads
 * with a message, so a thread opened from a card and not yet written in used
 * to show "Discussion" and a "D". Seeded from the list when the list already
 * has it, so an existing thread still paints its header instantly.
 */
export function useDiscussion(id: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: discussionsKeys.one(id),
    queryFn: async () => (await getDiscussion(id)).conversation,
    enabled: Boolean(id),
    // Same fallback as the list: without it the header's presence dot is
    // whatever it was when the screen opened, for as long as it stays open.
    refetchInterval: id ? POLL_INTERVAL : false,
    initialData: () =>
      queryClient
        .getQueryData<Awaited<ReturnType<typeof listDiscussions>>>(
          discussionsKeys.list(),
        )
        ?.data.find((d) => d.id === id),
  });
}

/**
 * The open thread.
 *
 * Polls, like the list. The socket is the fast path, but `POLL_INTERVAL` on the
 * list only covers the screen you LEFT: invalidating the list key does not
 * touch this one, and with the app's default `staleTime` of five minutes and
 * `refetchOnWindowFocus` off, a session whose socket never connected — the
 * WhatsApp webview this fallback exists for — sat in a conversation and saw
 * nothing arrive at all.
 */
export function useDiscussionThread(id: string) {
  return useQuery({
    queryKey: discussionsKeys.thread(id),
    queryFn: () => listDiscussionMessages(id, 1, THREAD_PAGE_SIZE),
    enabled: Boolean(id),
    refetchInterval: id ? THREAD_POLL_INTERVAL : false,
  });
}

/**
 * What is BEHIND the live page, a page at a time, on request.
 *
 * The thread used to be one call for the newest 50 with no way back: past that
 * the history was simply cut off at the top, silently, in a conversation people
 * keep for the record of what was agreed.
 *
 * Its own query rather than making the thread infinite, because the thread
 * polls: React Query refetches EVERY loaded page of an infinite query on each
 * interval, so an open history would have multiplied the poll by the number of
 * pages. This one never polls and is never invalidated by an arriving message —
 * see `discussionsKeys.history`.
 *
 * Offsets drift under a live thread: a message that arrives after the first
 * load pushes everything down by one, so page 2 hands back a message page 1
 * already had. Callers MUST merge by id. The drift only ever duplicates, never
 * skips, because new messages enter at the newest end and the window moves the
 * other way.
 */
export function useDiscussionHistory(id: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: discussionsKeys.history(id),
    queryFn: ({ pageParam }) =>
      listDiscussionMessages(id, pageParam, THREAD_PAGE_SIZE),
    // Page 1 is the live query's; history starts after it.
    initialPageParam: 2,
    getNextPageParam: (lastPage, allPages) => {
      const loaded =
        THREAD_PAGE_SIZE + allPages.reduce((n, page) => n + page.data.length, 0);
      return loaded < lastPage.total ? allPages.length + 2 : undefined;
    },
    enabled: Boolean(id) && enabled,
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
    // AWAITED, and that matters: react-query runs this before the callbacks
    // passed to `mutate`, so awaiting the thread refetch is what lets the caller
    // hold its pending bubble until the server's own version is in the cache.
    // Without it the bubble is dropped the instant the POST returns and the
    // message blinks out of the thread and back in.
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: discussionsKeys.thread(conversationId),
      });
      // The list is a different screen; nothing is waiting on it.
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

/**
 * Takes one of your own messages back, for both sides.
 *
 * Optimistic, and this one is safe to be: unlike sending, there is no verdict
 * to wait for — the server either accepts or refuses, and the tombstone looks
 * the same whoever draws it. The bubble turning to "supprimé" under the thumb
 * is the whole point; a round trip's delay would read as the tap having
 * missed.
 *
 * Written into the LIVE page only. History pages are a separate key and are
 * never invalidated by the socket, so `onSettled` refetches the thread rather
 * than trying to find the message across both.
 */
export function useDeleteDiscussionMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => deleteDiscussionMessage(messageId),
    onMutate: async (messageId: string) => {
      const key = discussionsKeys.thread(conversationId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous =
        queryClient.getQueryData<
          Awaited<ReturnType<typeof listDiscussionMessages>>
        >(key);

      if (previous) {
        queryClient.setQueryData(key, {
          ...previous,
          data: previous.data.map((message) =>
            message.id === messageId
              ? // The same shape the server sends back, so the bubble does not
                // change twice — once now and once on the refetch.
                {
                  ...message,
                  body: "",
                  redactions: [],
                  reported: false,
                  deletedAt: new Date().toISOString(),
                }
              : message,
          ),
        });
      }

      return { previous };
    },
    onError: (_error, _messageId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          discussionsKeys.thread(conversationId),
          context.previous,
        );
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: discussionsKeys.thread(conversationId),
      });
      // The row preview falls back to the previous message.
      void queryClient.invalidateQueries({ queryKey: discussionsKeys.list() });
      void queryClient.invalidateQueries({
        queryKey: discussionsKeys.history(conversationId),
      });
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
 * Listening only. The server takes exactly one inbound event, `typing`, which
 * stores nothing and has a hook of its own — everything that writes a row goes
 * over REST, where the message is validated and moderated.
 */
export function useDiscussionsSocket(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const socket = acquireDiscussionSocket();
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: discussionsKeys.all });
    };

    socket.on("message:new", refresh);
    socket.on("message:read", refresh);
    // A message was taken back, by either side. The refetch replaces it with
    // the server's tombstone; the payload carries only ids, so there is
    // nothing to write into the cache directly.
    socket.on("message:deleted", refresh);

    return () => {
      // By reference, not `off("message:new")`: another mount of this hook may
      // still be listening on the same shared socket.
      socket.off("message:new", refresh);
      socket.off("message:read", refresh);
      socket.off("message:deleted", refresh);
      releaseDiscussionSocket();
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
