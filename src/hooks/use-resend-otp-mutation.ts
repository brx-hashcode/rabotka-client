import { useMutation } from "@tanstack/react-query";
import { type SendOTPResponse } from "@/lib/api/auth-controller";

export function useResendOtpMutation() {
  return useMutation({
    mutationKey: ["resend-otp"],
    mutationFn: async (emailOrPhone: string): Promise<SendOTPResponse> => {
      // TODO: Remove mock and use real API
      // return await sendOTP(emailOrPhone);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true };
    },
  });
}
