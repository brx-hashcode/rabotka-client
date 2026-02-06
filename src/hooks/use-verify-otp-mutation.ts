import { useMutation } from "@tanstack/react-query";
import { type VerifyOTPResponse } from "@/lib/api/auth-controller";
import { toastMessages } from "@/content/landing/login";
import { toast } from "@/hooks/use-toast";

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
    onSuccess: () => {
      toast({
        title: toastMessages.step2.success.title,
        description: toastMessages.step2.success.description,
      });
    },
    onError: (error) => {
      toast({
        title: toastMessages.step2.error.title,
        description: error.message,
      });
    },
  });
}
