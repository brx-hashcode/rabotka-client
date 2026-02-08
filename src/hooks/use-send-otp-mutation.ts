import { useMutation } from "@tanstack/react-query";
import { sendOTP, type SendOTPResponse } from "@/lib/api/auth-controller";
import { toast } from "@/hooks/use-toast";
import { toastMessages } from "@/content/landing/login";

export function useSendOtpMutation() {
  return useMutation({
    mutationKey: ["send-otp"],
    mutationFn: async (emailOrPhone: string): Promise<SendOTPResponse> => {
      return await sendOTP(emailOrPhone);
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
