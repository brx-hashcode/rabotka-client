import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listComments, addComment, deleteComment, type CreateCommentPayload, type ClaimCommentItem } from "@/lib/api/claims-controller";
import { useToast } from "@/hooks/use-toast";

export const useClaimComments = (
  claimId: string | undefined,
  { enabled = true }: { enabled?: boolean } = {},
) => {
  return useQuery({
    queryKey: ["profile", "claims", claimId, "comments"],
    queryFn: () => listComments(claimId!),
    enabled: !!claimId && enabled,
    refetchOnMount: true,
  });
};

export const useAddClaimComment = (claimId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateCommentPayload) =>
      claimId ? addComment(claimId, data) : Promise.reject("No claim ID"),
    onSuccess: (newComment) => {
      queryClient.setQueryData<ClaimCommentItem[]>(
        ["profile", "claims", claimId, "comments"],
        (prev = []) => {
          if (prev.some((c) => c.id === newComment.id)) return prev;
          return [...prev, newComment];
        },
      );
      // Refresh list + detail so updatedAt / status / activity stay in sync.
      queryClient.invalidateQueries({
        queryKey: ["profile", "claims"],
        refetchType: "all",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteClaimComment = (claimId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (commentId: string) =>
      claimId ? deleteComment(claimId, commentId) : Promise.reject("No claim ID"),
    onSuccess: (_, commentId) => {
      queryClient.setQueryData<ClaimCommentItem[]>(
        ["profile", "claims", claimId, "comments"],
        (prev = []) => prev.filter((c) => c.id !== commentId),
      );
      queryClient.invalidateQueries({
        queryKey: ["profile", "claims"],
        refetchType: "all",
      });
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    },
  });
};
