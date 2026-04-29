import { useEffect } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import type { ClaimCommentItem } from "@/lib/api/claims-controller";

export function useClaimCommentsSocket(claimId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!claimId) return;

    const socket = io("/claim-comments", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      socket.emit("join-claim", { claimId });
    });

    socket.on("comment:new", (comment: ClaimCommentItem) => {
      queryClient.setQueryData<ClaimCommentItem[]>(
        ["profile", "claims", claimId, "comments"],
        (prev = []) => {
          if (prev.some((c) => c.id === comment.id)) return prev;
          return [...prev, comment];
        },
      );
    });

    socket.on("comment:deleted", ({ commentId }: { commentId: string }) => {
      queryClient.setQueryData<ClaimCommentItem[]>(
        ["profile", "claims", claimId, "comments"],
        (prev = []) => prev.filter((c) => c.id !== commentId),
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [claimId, queryClient]);
}
