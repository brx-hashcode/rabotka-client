import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { loginContent } from "@/content/landing/login";
import { useSendOtpMutation } from "@/hooks/use-send-otp-mutation";
import { useVerifyOtpMutation } from "@/hooks/use-verify-otp-mutation";
import { useResendOtpMutation } from "@/hooks/use-resend-otp-mutation";
import {
  Step1EmailPhoneForm,
  Step2OTPForm,
  Step3Redirecting,
} from "./login-steps";

type LoginDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

type Step = 1 | 2 | 3;

export const LoginDialog = ({
  isOpen,
  setIsOpen,
}: Readonly<LoginDialogProps>) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [emailOrPhone, setEmailOrPhone] = useState<string>("");
  const [apiError, setApiError] = useState<string | null>(null);

  const sendOtpMutation = useSendOtpMutation();
  const verifyOtpMutation = useVerifyOtpMutation();
  const resendOtpMutation = useResendOtpMutation();

  const isSendingOtp = sendOtpMutation.isPending;
  const isVerifyingOtp = verifyOtpMutation.isPending;
  const isResendingOtp = resendOtpMutation.isPending;

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setEmailOrPhone("");
      setApiError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        setIsOpen(false);
        navigate("/dashboard");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, navigate, setIsOpen]);

  const handleStep1Submit = useCallback(
    async (data: { emailOrPhone: string }) => {
      setApiError(null);
      try {
        await sendOtpMutation.mutateAsync(data.emailOrPhone);
        setEmailOrPhone(data.emailOrPhone);
        setStep(2);
      } catch (error) {
        setApiError((error as Error).message);
      }
    },
    [sendOtpMutation],
  );

  const handleStep2Submit = useCallback(
    async (data: { otp: string }) => {
      setApiError(null);
      try {
        await verifyOtpMutation.mutateAsync({
          emailOrPhone,
          otp: data.otp,
        });
        setStep(3);
      } catch (error) {
        setApiError((error as Error).message);
      }
    },
    [emailOrPhone, verifyOtpMutation],
  );

  const handleResendOTP = useCallback(async () => {
    setApiError(null);
    try {
      await resendOtpMutation.mutateAsync(emailOrPhone);
    } catch (error) {
      setApiError((error as Error).message);
    }
  }, [emailOrPhone, resendOtpMutation]);

  const handleDialogClose = useCallback(
    (open: boolean) => {
      if (!open) {
        setIsOpen(false);
      }
    },
    [setIsOpen],
  );

  const getDialogTitle = () => {
    if (step === 1) return loginContent.step1.title;
    if (step === 2) return loginContent.step2.title;
    if (step === 3) return loginContent.step3.title;
    return "";
  };

  const getDialogDescription = () => {
    if (step === 1) return loginContent.step1.description;
    if (step === 2) return loginContent.step2.description;
    if (step === 3) return loginContent.step3.redirecting;
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <Step1EmailPhoneForm
            onSubmit={handleStep1Submit}
            isLoading={isSendingOtp}
            serverError={apiError}
          />
        )}

        {step === 2 && (
          <Step2OTPForm
            onSubmit={handleStep2Submit}
            onResend={handleResendOTP}
            isVerifying={isVerifyingOtp}
            isResending={isResendingOtp}
            serverError={apiError}
          />
        )}

        {step === 3 && <Step3Redirecting />}
      </DialogContent>
    </Dialog>
  );
};
