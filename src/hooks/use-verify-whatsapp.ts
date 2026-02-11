import { useQuery } from "@tanstack/react-query";
import { verifyWhatsApp, type VerifyWhatsAppResponse } from "@/lib/api/verify-controller";

export function useVerifyWhatsApp(token: string | null) {
  return useQuery({
    queryKey: ["verify", "whatsapp", token],
    queryFn: async (): Promise<VerifyWhatsAppResponse> => {
      if (!token) {
        throw new Error("Token is required");
      }
      return await verifyWhatsApp(token);
    },
    enabled: !!token,
    retry: false,
  });
}
