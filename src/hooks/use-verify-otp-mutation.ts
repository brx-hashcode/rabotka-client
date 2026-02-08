import { useMutation } from "@tanstack/react-query";
import { verifyOTP, type VerifyOTPResponse } from "@/lib/api/auth-controller";
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
      return await verifyOTP(emailOrPhone, otp);
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
