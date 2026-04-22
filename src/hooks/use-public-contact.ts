import { useQuery } from "@tanstack/react-query";
import { getPublicContact } from "@/lib/api/system-config-controller";

export function usePublicContact() {
  return useQuery({
    queryKey: ["public-contact"],
    queryFn: getPublicContact,
    staleTime: 5 * 60 * 1000,
  });
}
