import { io, type Socket } from "socket.io-client";

/**
 * One connection to `/messagerie`, shared by everything that needs it.
 *
 * It used to be created inside `useDiscussionsSocket`, which was fine while
 * that was the only consumer. The typing indicator is a second one, mounted on
 * the same screen — and two websockets to the same namespace from one tab is
 * two handshakes, two presence entries, and two of every message that arrives.
 *
 * Refcounted rather than left open: the socket holds a presence key with a TTL,
 * and a connection that outlived the screens using it would keep somebody
 * showing as "en ligne" after they left the app.
 */
let socket: Socket | null = null;
let holders = 0;

export function acquireDiscussionSocket(): Socket {
  socket ??= io("/messagerie", {
    transports: ["websocket"],
    withCredentials: true,
  });
  holders += 1;
  return socket;
}

export function releaseDiscussionSocket(): void {
  holders = Math.max(0, holders - 1);
  if (holders > 0 || !socket) return;
  socket.disconnect();
  socket = null;
}
