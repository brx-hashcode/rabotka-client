import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAvatar } from "@/lib/api/profile-controller";

export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["profile", "avatar"],
    mutationFn: (file: File) => updateAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
  });
}
