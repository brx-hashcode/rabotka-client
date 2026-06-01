import { useQuery } from "@tanstack/react-query";
import { getWelcomeCredits } from "@/lib/api/system-config-controller";

export function useWelcomeCredits(profileType: "WORKER" | "EMPLOYER") {
  return useQuery({
    queryKey: ["public-welcome-credits", profileType],
    queryFn: () => getWelcomeCredits(profileType),
    staleTime: 10 * 60 * 1000,
  });
}
