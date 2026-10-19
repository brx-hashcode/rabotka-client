import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { logout } from "@/lib/api/auth-controller";
import { disablePush } from "@/lib/push";
import { useToast } from "@/hooks/use-toast";

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ["logout"],
    // Unsubscribe first, while the session still exists: otherwise the next
    // person to sign in on this phone would get this profile's notifications
    // until they turned push on themselves. Best-effort.
    mutationFn: async () => {
      await disablePush().catch(() => undefined);
      return logout();
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["profile", "me"] });
      navigate("/", { replace: true });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Échec de la déconnexion. Veuillez réessayer." });
    },
  });
}
