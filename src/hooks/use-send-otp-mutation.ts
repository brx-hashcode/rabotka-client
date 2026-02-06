import { useMutation } from "@tanstack/react-query";
import { type SendOTPResponse } from "@/lib/api/auth-controller";

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
      throw new Error("Your email or phone is incorrect");
    },
  });
}
