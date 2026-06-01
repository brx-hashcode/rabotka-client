import { useQuery } from "@tanstack/react-query";
import { getWelcomeCredits } from "@/lib/api/system-config-controller";

export function useWelcomeCredits() {
  return useQuery({
    queryKey: ["public-welcome-credits"],
    queryFn: getWelcomeCredits,
    staleTime: 10 * 60 * 1000,
  });
}
