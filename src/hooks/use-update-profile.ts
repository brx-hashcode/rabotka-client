import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateProfile,
  type UpdateProfilePayload,
} from "@/lib/api/profile-controller";
import { useToast } from "@/hooks/use-toast";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ["profile", "update"],
    mutationFn: (data: UpdateProfilePayload) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Échec de la mise à jour du profil." });
    },
  });
}
