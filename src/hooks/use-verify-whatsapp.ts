import { useMutation } from "@tanstack/react-query";
import { verifyWhatsApp, type VerifyWhatsAppResponse } from "@/lib/api/verify-controller";

export function useVerifyWhatsApp() {
  return useMutation({
    mutationKey: ["verify", "whatsapp"],
    mutationFn: async (token: string): Promise<VerifyWhatsAppResponse> => {
      return await verifyWhatsApp(token);
    },
    retry: false,
  });
}
