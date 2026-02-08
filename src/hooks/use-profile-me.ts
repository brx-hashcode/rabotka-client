import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api/profile-controller";

export function useProfileMe() {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: getMe,
    retry: false,
  });
}
