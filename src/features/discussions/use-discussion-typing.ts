import { useCallback, useEffect, useRef, useState } from "react";
import {
  acquireDiscussionSocket,
  releaseDiscussionSocket,
} from "./discussion-socket";
import {
  TYPING_WINDOW_MS,
  isTypingVisible,
  shouldEmitTyping,
} from "./typing-window";

/**
 * "…en train d'écrire", both ways.
 *
 * The only thing this screen sends over the socket. It stores nothing, so the
 * server accepts it inbound where it accepts nothing else — see the note at
 * the top of `profile-chat.gateway.ts`.
 *
 * `notifyTyping` is called on every keystroke and throttled here; the server
 * holds its own floor, because the client's throttle is not the copy that
 * matters. The indicator expires on a timer rather than on a "stopped" event:
 * there is no such event, deliberately, since one that went missing would
 * leave the dots bouncing for ever.
 */
export function useDiscussionTyping(conversationId: string, enabled: boolean) {
  const [counterpartTyping, setCounterpartTyping] = useState(false);
  const lastEmittedAt = useRef<number | null>(null);
  const socketRef = useRef<ReturnType<typeof acquireDiscussionSocket> | null>(
    null,
  );

  useEffect(() => {
    if (!enabled || !conversationId) return;

    const socket = acquireDiscussionSocket();
    socketRef.current = socket;

    let lastEventAt: number | null = null;
    let expiry: ReturnType<typeof setTimeout> | undefined;

    const onTyping = (payload: { conversationId?: string }) => {
      // The socket is per profile, not per thread: events for the OTHER
      // conversations this person is in arrive here too.
      if (payload?.conversationId !== conversationId) return;

      lastEventAt = Date.now();
      setCounterpartTyping(true);

      clearTimeout(expiry);
      expiry = setTimeout(() => {
        if (!isTypingVisible(lastEventAt, Date.now())) {
          setCounterpartTyping(false);
        }
      }, TYPING_WINDOW_MS);
    };

    // A message that has landed is proof they have finished. Waiting out the
    // window instead would leave three dots bouncing under the bubble they
    // just sent.
    const onMessage = (payload: { conversationId?: string }) => {
      if (payload?.conversationId !== conversationId) return;
      lastEventAt = null;
      clearTimeout(expiry);
      setCounterpartTyping(false);
    };

    socket.on("typing", onTyping);
    socket.on("message:new", onMessage);

    return () => {
      clearTimeout(expiry);
      socket.off("typing", onTyping);
      socket.off("message:new", onMessage);
      socketRef.current = null;
      setCounterpartTyping(false);
      lastEmittedAt.current = null;
      releaseDiscussionSocket();
    };
  }, [conversationId, enabled]);

  const notifyTyping = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !conversationId) return;

    const now = Date.now();
    if (!shouldEmitTyping(lastEmittedAt.current, now)) return;
    lastEmittedAt.current = now;
    socket.emit("typing", { conversationId });
  }, [conversationId]);

  return { counterpartTyping, notifyTyping };
}
