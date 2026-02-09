import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateProfile,
  type UpdateProfilePayload,
} from "@/lib/api/profile-controller";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["profile", "update"],
    mutationFn: (data: UpdateProfilePayload) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
  });
}
