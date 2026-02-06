import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { loginContent } from "@/content/landing/login";
import {
  Step1EmailPhoneForm,
  Step2OTPForm,
  Step3Redirecting,
} from "./login-steps";

type LoginDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

type Step = 1 | 2 | 3 | "error";

type ErrorStateProps = {
  errorMessage: string | null;
  onRetry: () => void;
};

export const LoginDialog = ({
  isOpen,
  setIsOpen,
}: Readonly<LoginDialogProps>) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [emailOrPhone, setEmailOrPhone] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

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

  const handleStep1Submit = async (data: { emailOrPhone: string }) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setEmailOrPhone(data.emailOrPhone);
      setStep(2);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de l'envoi du code";
      setApiError(errorMessage);
      setStep("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = useCallback(
    async (data: { otp: string }) => {
      setIsLoading(true);
      setApiError(null);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (!emailOrPhone) {
          throw new Error("Email or phone number is required");
        }
        setStep(3);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Code de vérification invalide";
        setApiError(errorMessage);
        setStep("error");
      } finally {
        setIsLoading(false);
      }
    },
    [emailOrPhone],
  );

  const handleResendOTP = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de l'envoi du code";
      setApiError(errorMessage);
      setStep("error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRetry = useCallback(() => {
    setStep(1);
    setApiError(null);
  }, []);

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setIsOpen(false);
    }
  };

  const getDialogTitle = () => {
    if (step === 1) return loginContent.step1.title;
    if (step === 2) return loginContent.step2.title;
    if (step === 3) return loginContent.step3.title;
    if (step === "error") return loginContent.error.title;
    return "";
  };

  const getDialogDescription = () => {
    if (step === 1) return loginContent.step1.description;
    if (step === 2) return loginContent.step2.description;
    if (step === 3) return loginContent.step3.redirecting;
    if (step === "error")
      return apiError || "Une erreur s'est produite lors de la connexion";
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
            isLoading={isLoading}
            error={apiError}
          />
        )}

        {step === 2 && (
          <Step2OTPForm
            onSubmit={handleStep2Submit}
            onResend={handleResendOTP}
            isLoading={isLoading}
            error={apiError}
          />
        )}

        {step === 3 && <Step3Redirecting />}

        {step === "error" && (
          <ErrorState errorMessage={apiError} onRetry={handleRetry} />
        )}
      </DialogContent>
    </Dialog>
  );
};

const ErrorState = ({ errorMessage, onRetry }: Readonly<ErrorStateProps>) => {
  return (
    <div className="flex flex-col items-center space-y-4 py-4">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
        <XCircle className="h-10 w-10 text-red-500" />
      </div>
      <p className="text-sm text-destructive text-center">
        {errorMessage || "Une erreur s'est produite lors de la connexion"}
      </p>
      <Button
        onClick={onRetry}
        className="w-full bg-red-500 hover:bg-red-600 text-white"
      >
        {loginContent.error.button}
      </Button>
    </div>
  );
};
