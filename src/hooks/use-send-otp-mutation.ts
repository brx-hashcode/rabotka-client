import { useMutation } from "@tanstack/react-query";
import { type SendOTPResponse } from "@/lib/api/auth-controller";
import { toast } from "@/hooks/use-toast";
import { toastMessages } from "@/content/landing/login";

export function useSendOtpMutation() {
  return useMutation({
    mutationKey: ["send-otp"],
    mutationFn: async (emailOrPhone: string): Promise<SendOTPResponse> => {
      // TODO: Remove mock and use real API
      // return await sendOTP(emailOrPhone);
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (emailOrPhone === "test@test.com") {
        return { success: true };
      } else if (emailOrPhone === "+242069917686") {
        return { success: true };
      }
      throw new Error("L'email ou le numéro de téléphone est incorrect");
    },
    onSuccess: () => {
      toast({
        title: toastMessages.step1.success.title,
        description: toastMessages.step1.success.description,
      });
    },
    onError: (error) => {
      toast({
        title: toastMessages.step1.error.title,
        description: error.message,
      });
    },
  });
}
