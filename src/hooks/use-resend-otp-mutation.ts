import { useMutation } from "@tanstack/react-query";
import { type SendOTPResponse } from "@/lib/api/auth-controller";
import { toast } from "@/hooks/use-toast";
import { toastMessages } from "@/content/landing/login";

export function useResendOtpMutation() {
  return useMutation({
    mutationKey: ["resend-otp"],
    mutationFn: async (emailOrPhone: string): Promise<SendOTPResponse> => {
      // TODO: Remove mock and use real API
      // return await sendOTP(emailOrPhone);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: toastMessages.resendOtp.success.title,
        description: toastMessages.resendOtp.success.description,
      });
    },
    onError: (error) => {
      toast({
        title: toastMessages.resendOtp.error.title,
        description: error.message,
      });
    },
  });
}
