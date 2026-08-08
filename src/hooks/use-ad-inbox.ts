import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import {
  getAdInbox,
  markAdSeen,
  type InAppAd,
} from "@/lib/api/ad-inbox-controller";
import { useProfileMe } from "./use-profile-me";

export const adInboxQueryKey = ["ads", "inbox"] as const;

/** Fallback for sessions where the socket never connects (WhatsApp webview). */
const POLL_INTERVAL = 3 * 60 * 1000;

/**
 * Pending in-app advertisements for the signed-in profile.
 *
 * Two delivery paths, on purpose: the socket makes an ad dispatched right now
 * appear immediately, while the poll covers users whose socket dropped or who
 * were offline when the campaign fired.
 */
export function useAdInbox() {
  const { data: profile } = useProfileMe();
  const enabled = profile?.status === "ACTIVE";

  useAdInboxSocket(enabled);

  return useQuery<InAppAd[]>({
    queryKey: adInboxQueryKey,
    queryFn: getAdInbox,
    enabled,
    refetchInterval: enabled ? POLL_INTERVAL : false,
    staleTime: 0,
  });
}

/**
 * Records that a delivery has been seen — a viewport impression on its feed
 * card, or a tap through an untracked destination.
 *
 * Server-side this stamps `opened_at` and retires the delivery, so it is the
 * one write that decides whether an ad comes back.
 */
export function useMarkAdSeen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deliveryId: string) => markAdSeen(deliveryId),
    // Keeps the query honest and stops the next poll resurrecting an ad that
    // has already been counted. It is deliberately NOT what removes the card:
    // the feed renders from a frozen slate (features/ads/ad-slate) precisely so
    // a counted ad stays put instead of collapsing the list mid-scroll.
    onMutate: (deliveryId: string) => {
      queryClient.setQueryData<InAppAd[]>(adInboxQueryKey, (ads) =>
        (ads ?? []).filter((ad) => ad.deliveryId !== deliveryId),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adInboxQueryKey });
    },
  });
}

/**
 * Joins the ad-inbox namespace and refetches when the server pushes one. The
 * room is derived server-side from the auth cookie, so there is nothing to emit.
 */
function useAdInboxSocket(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const socket = io("/ad-inbox", {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("ad:new", () => {
      queryClient.invalidateQueries({ queryKey: adInboxQueryKey });
    });

    return () => {
      socket.disconnect();
    };
  }, [enabled, queryClient]);
}
