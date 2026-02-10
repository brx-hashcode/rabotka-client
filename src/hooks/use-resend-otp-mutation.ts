import { useMutation } from "@tanstack/react-query";
import {
  resendOTP,
  type SendOTPResponse,
} from "@/lib/api/auth-controller";
import { toast } from "@/hooks/use-toast";
import { toastMessages } from "@/content/landing/login";

export function useResendOtpMutation() {
  return useMutation({
    mutationKey: ["resend-otp"],
    mutationFn: async (emailOrPhone: string): Promise<SendOTPResponse> => {
      return await resendOTP(emailOrPhone);
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
