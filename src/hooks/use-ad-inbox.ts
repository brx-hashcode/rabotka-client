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

export function useDismissAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deliveryId: string) => markAdSeen(deliveryId),
    // Drop it from the cache right away so the card disappears on tap instead
    // of after the round-trip — and stays gone across route changes, which
    // remount the popup. A failed call simply lets the next poll bring it back.
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
