import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listComments, addComment, deleteComment, type CreateCommentPayload } from "@/lib/api/claims-controller";
import { useToast } from "@/hooks/use-toast";

export const useClaimComments = (
  claimId: string | undefined,
  { refetchInterval = 10000, enabled = true }: { refetchInterval?: number; enabled?: boolean } = {},
) => {
  return useQuery({
    queryKey: ["profile", "claims", claimId, "comments"],
    queryFn: () => listComments(claimId!),
    enabled: !!claimId && enabled,
    refetchInterval,
  });
};

export const useAddClaimComment = (claimId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateCommentPayload) =>
      claimId ? addComment(claimId, data) : Promise.reject("No claim ID"),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile", "claims", claimId, "comments"],
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile", "claims", claimId, "comments"],
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
