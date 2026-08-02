import { useQuery } from "@tanstack/react-query";
import { getContactedProfiles } from "@/lib/api/profile-controller";

type UseContactedProfilesParams = {
  enabled?: boolean;
};

export function useContactedProfiles({
  enabled = true,
}: UseContactedProfilesParams = {}) {
  return useQuery({
    queryKey: ["profile", "contacts"],
    queryFn: getContactedProfiles,
    enabled,
  });
}
