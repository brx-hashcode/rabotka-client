import { useQuery } from "@tanstack/react-query";
import { getInvoices } from "@/lib/api/profile-controller";

type UseProfileInvoicesParams = {
  enabled?: boolean;
};

export function useProfileInvoices({
  enabled = true,
}: UseProfileInvoicesParams = {}) {
  return useQuery({
    queryKey: ["profile", "invoices"],
    queryFn: getInvoices,
    enabled,
  });
}
