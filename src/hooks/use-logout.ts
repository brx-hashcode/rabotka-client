import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { logout } from "@/lib/api/auth-controller";

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationKey: ["logout"],
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["profile", "me"] });
      navigate("/", { replace: true });
    },
  });
}
