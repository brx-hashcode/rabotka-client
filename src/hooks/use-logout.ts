import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { logout } from "@/lib/api/auth-controller";
import { useToast } from "@/hooks/use-toast";

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ["logout"],
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["profile", "me"] });
      navigate("/login", { replace: true });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Échec de la déconnexion. Veuillez réessayer." });
    },
  });
}
