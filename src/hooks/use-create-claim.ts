import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClaim, type CreateClaimPayload } from "@/lib/api/claims-controller";
import { useToast } from "@/hooks/use-toast";

export const useCreateClaim = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateClaimPayload) => createClaim(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "claims"] });
      toast({
        title: "Success",
        description: "Claim created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create claim",
        variant: "destructive",
      });
    },
  });
};
