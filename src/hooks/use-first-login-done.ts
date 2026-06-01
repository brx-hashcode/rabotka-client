import { useMutation } from "@tanstack/react-query";
import { markFirstLoginDone } from "@/lib/api/profile-controller";

export function useFirstLoginDone() {
  return useMutation({
    mutationFn: markFirstLoginDone,
  });
}
