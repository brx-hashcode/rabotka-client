import { useState, useCallback, useEffect } from "react";
import { Seo } from "@/hooks/use-seo";
import { useNavigate } from "react-router";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { Loader } from "lucide-react";
import rabotkaLogo from "@/assets/rabotka-logo.png?format=webp";
import { loginContent } from "@/content/landing/login";
import { useSendOtpMutation } from "@/hooks/use-send-otp-mutation";
import { useVerifyOtpMutation } from "@/hooks/use-verify-otp-mutation";
import { useResendOtpMutation } from "@/hooks/use-resend-otp-mutation";
import { getMe } from "@/lib/api/profile-controller";
import {
  Step1PhoneForm,
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
  const [phone, setPhone] = useQueryState("id", {
    defaultValue: "",
  });
  // When no explicit redirect is set, always pass through /onboarding/avatar
  // so users without a profile picture are prompted to add one.
  const [redirectTo] = useQueryState("redirect", {
    defaultValue: "/onboarding/avatar",
  });
  const [apiError, setApiError] = useState<string | null>(null);

  const sendOtpMutation = useSendOtpMutation();
  const verifyOtpMutation = useVerifyOtpMutation();
  const resendOtpMutation = useResendOtpMutation();

  useEffect(() => {
    if (step === "3") {
      const timer = setTimeout(async () => {
        // If an explicit redirect was provided (e.g. from success page), use it directly.
        // Otherwise check firstLogin to decide whether to prompt for avatar or go to profile.
        if (redirectTo !== "/onboarding/avatar") {
          navigate(redirectTo);
          return;
        }
        try {
          const profile = await getMe();
          navigate(profile.firstLogin ? "/onboarding/avatar" : "/profile");
        } catch {
          navigate("/onboarding/avatar");
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, navigate, redirectTo]);

  useEffect(() => {
    if (step === "2" && !phone) {
      setStep("1");
    }
  }, [step, phone, setStep]);

  const handleStep1Submit = useCallback(
    async (data: { phone: string }) => {
      setApiError(null);
      try {
        await sendOtpMutation.mutateAsync(data.phone);
        setPhone(data.phone);
        setStep("2");
      } catch (error) {
        setApiError((error as Error).message);
      }
    },
    [sendOtpMutation, setPhone, setStep],
  );

  const handleStep2Submit = useCallback(
    async (data: { otp: string }) => {
      setApiError(null);
      try {
        await verifyOtpMutation.mutateAsync({
          emailOrPhone: phone,
          otp: data.otp,
        });
        setStep("3");
      } catch (error) {
        setApiError((error as Error).message);
      }
    },
    [phone, verifyOtpMutation, setStep],
  );

  const handleResendOTP = useCallback(async () => {
    setApiError(null);
    try {
      await resendOtpMutation.mutateAsync(phone);
    } catch (error) {
      setApiError((error as Error).message);
    }
  }, [phone, resendOtpMutation]);

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
            <Step1PhoneForm
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
