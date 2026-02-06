import { useMutation } from "@tanstack/react-query";
import { type VerifyOTPResponse } from "@/lib/api/auth-controller";

type VerifyOtpVariables = {
  emailOrPhone: string;
  otp: string;
};

export function useVerifyOtpMutation() {
  return useMutation({
    mutationKey: ["verify-otp"],
    mutationFn: async ({
      emailOrPhone,
      otp,
    }: VerifyOtpVariables): Promise<VerifyOTPResponse> => {
      // TODO: Remove mock and use real API
      // return await verifyOTP(emailOrPhone, otp);
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (otp === "123456") {
        return { success: true };
      }
      throw new Error("Le code de vérification est incorrect");
    },
  });
}
