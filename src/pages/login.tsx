import { useState, useCallback, useEffect } from "react";
import { Seo } from "@/hooks/use-seo";
import { useNavigate } from "react-router";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { Loader } from "lucide-react";
import rabotkaLogo from "@/assets/rabotka-logo.png";
import { loginContent } from "@/content/landing/login";
import { useSendOtpMutation } from "@/hooks/use-send-otp-mutation";
import { useVerifyOtpMutation } from "@/hooks/use-verify-otp-mutation";
import { useResendOtpMutation } from "@/hooks/use-resend-otp-mutation";
import {
  Step1EmailPhoneForm,
  Step2OTPForm,
} from "@/features/landing/components/login-steps";

const STEPS = ["1", "2", "3"] as const;
type Step = (typeof STEPS)[number];

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useQueryState(
    "step",
    parseAsStringLiteral(STEPS).withDefault(STEPS[0]),
  );
  const [emailOrPhone, setEmailOrPhone] = useQueryState("id", {
    defaultValue: "",
  });
  const [apiError, setApiError] = useState<string | null>(null);

  const sendOtpMutation = useSendOtpMutation();
  const verifyOtpMutation = useVerifyOtpMutation();
  const resendOtpMutation = useResendOtpMutation();

  useEffect(() => {
    if (step === "3") {
      const timer = setTimeout(() => {
        navigate("/profile");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  useEffect(() => {
    if (step === "2" && !emailOrPhone) {
      setStep("1");
    }
  }, [step, emailOrPhone, setStep]);

  const handleStep1Submit = useCallback(
    async (data: { emailOrPhone: string }) => {
      setApiError(null);
      try {
        await sendOtpMutation.mutateAsync(data.emailOrPhone);
        setEmailOrPhone(data.emailOrPhone);
        setStep("2");
      } catch (error) {
        setApiError((error as Error).message);
      }
    },
    [sendOtpMutation, setEmailOrPhone, setStep],
  );

  const handleStep2Submit = useCallback(
    async (data: { otp: string }) => {
      setApiError(null);
      try {
        await verifyOtpMutation.mutateAsync({
          emailOrPhone,
          otp: data.otp,
        });
        setStep("3");
      } catch (error) {
        setApiError((error as Error).message);
      }
    },
    [emailOrPhone, verifyOtpMutation, setStep],
  );

  const handleResendOTP = useCallback(async () => {
    setApiError(null);
    try {
      await resendOtpMutation.mutateAsync(emailOrPhone);
    } catch (error) {
      setApiError((error as Error).message);
    }
  }, [emailOrPhone, resendOtpMutation]);

  return (
    <>
      <Seo
        title="Connexion - Rabotka"
        description="Connectez-vous à votre compte Rabotka pour accéder à vos offres d'emploi et gérer votre profil."
        canonical="/login"
        noIndex={true}
      />
    <div className="min-h-dvh flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6">
        <img
          src={rabotkaLogo}
          alt="Rabotka"
          className="w-20 h-20 object-contain mb-6"
        />

        {step === "3" ? (
          <div className="flex flex-col items-center gap-4">
            <Loader className="size-10 animate-spin text-whatsapp" />
            <h1 className="text-xl font-bold text-foreground">
              {loginContent.step3.title}
            </h1>
            <p className="text-sm text-muted-foreground text-center">
              {loginContent.step3.redirecting}
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {step === "1"
                ? loginContent.step1.title
                : loginContent.step2.title}
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-xs mb-8">
              {step === "1"
                ? loginContent.step1.description
                : loginContent.step2.description}
            </p>
          </>
        )}
      </div>

      {step !== "3" && (
        <div className="px-6 pb-10 w-full max-w-sm mx-auto">
          {step === "1" && (
            <Step1EmailPhoneForm
              onSubmit={handleStep1Submit}
              isLoading={sendOtpMutation.isPending}
              serverError={apiError}
            />
          )}

          {step === "2" && (
            <Step2OTPForm
              onSubmit={handleStep2Submit}
              onResend={handleResendOTP}
              isVerifying={verifyOtpMutation.isPending}
              isResending={resendOtpMutation.isPending}
              serverError={apiError}
            />
          )}
        </div>
      )}
    </div>
    </>
  );
}
