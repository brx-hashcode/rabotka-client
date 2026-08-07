import { useEffect } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

type JobEvent = {
  jobOfferId: string;
  applicationId: string;
  kind: "completed" | "rated";
};

/**
 * Keeps both sides of a mission in sync without a reload.
 *
 * A mission has two parties acting from two devices, and each action changes
 * what the other should see: the worker confirming is what unlocks the
 * employer's rating action, the employer rating is what removes it.
 * `invalidateQueries` only ever refreshes the browser that performed the
 * mutation, so the counterparty needs a push — and inside WhatsApp's webview it
 * will never self-correct, because no focus or reconnect events fire there.
 *
 * The server derives the room from the session cookie, so there is nothing to
 * subscribe to and nothing to get wrong here. Purely an optimisation: a client
 * that never connects still gets correct data on its next fetch.
 */
export function useJobEvents(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const socket = io("/job-events", {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("job:changed", (event: JobEvent) => {
      // `refetchType: "all"` for the same reason the push exists: a query merely
      // marked stale would sit there until something triggered a refetch, and in
      // the webview nothing will.
      const refetchAll = { refetchType: "all" } as const;

      // Prefix — also covers ["job-offer", id, "applications"], which carries
      // `ratedByEmployer` and therefore decides whether the employer's rating
      // button is still on screen.
      queryClient.invalidateQueries({
        queryKey: ["job-offer", event.jobOfferId],
        ...refetchAll,
      });
      queryClient.invalidateQueries({
        queryKey: ["employer", "job-offers"],
        ...refetchAll,
      });
      queryClient.invalidateQueries({
        queryKey: ["worker", "missions"],
        ...refetchAll,
      });
      queryClient.invalidateQueries({
        queryKey: ["worker", "mission", event.applicationId],
        ...refetchAll,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [enabled, queryClient]);
}
