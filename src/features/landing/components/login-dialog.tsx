import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { emailOrPhoneSchema, otpSchema } from "@/lib/validations/auth";
import { sendOTP, verifyOTP } from "@/lib/api/auth-controller";
import { loginContent } from "@/content/landing/login";
import { LoginSuccessDialog } from "./login-success-dialog";
import { LoginErrorDialog } from "./login-error-dialog";

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
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const step1Form = useForm({
    resolver: zodResolver(emailOrPhoneSchema),
    defaultValues: {
      emailOrPhone: "",
    },
  });

  const step2Form = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setEmailOrPhone("");
      setApiError(null);
      step1Form.reset();
      step2Form.reset();
    }
  }, [isOpen, step1Form, step2Form]);

  // Handle redirect after step 3
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
      await sendOTP(data.emailOrPhone);
      setEmailOrPhone(data.emailOrPhone);
      setStep(2);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de l'envoi du code";
      setApiError(errorMessage);
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async (data: { otp: string }) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await verifyOTP(emailOrPhone, data.otp);
      setShowSuccessDialog(true);
      setStep(3);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Code de vérification invalide";
      setApiError(errorMessage);
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      await sendOTP(emailOrPhone);
      step2Form.reset();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de l'envoi du code";
      setApiError(errorMessage);
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
    }
  }, [emailOrPhone, step2Form]);

  const handleRetry = useCallback(() => {
    setStep(1);
    setApiError(null);
    step1Form.reset();
    step2Form.reset();
  }, [step1Form, step2Form]);

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setIsOpen(false);
    }
  };

  const getDialogTitle = () => {
    if (step === 1) return loginContent.step1.title;
    if (step === 2) return loginContent.step2.title;

    return loginContent.step3.redirecting;
  };

  const getDialogDescription = () => {
    if (step === 1) return loginContent.step1.description;
    if (step === 2) return loginContent.step2.description;
    return null;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
            {step !== 3 && (
              <DialogDescription>{getDialogDescription()}</DialogDescription>
            )}
          </DialogHeader>

          {step === 1 && (
            <Form {...step1Form}>
              <form
                onSubmit={step1Form.handleSubmit(handleStep1Submit)}
                className="space-y-4"
              >
                <FormField
                  control={step1Form.control}
                  name="emailOrPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email ou téléphone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            loginContent.step1.emailPlaceholder +
                            " / " +
                            loginContent.step1.phonePlaceholder
                          }
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {apiError && (
                  <p className="text-sm text-destructive">{apiError}</p>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    loginContent.step1.submitButton
                  )}
                </Button>
              </form>
            </Form>
          )}

          {step === 2 && (
            <Form {...step2Form}>
              <form
                onSubmit={step2Form.handleSubmit(handleStep2Submit)}
                className="space-y-4"
              >
                <FormField
                  control={step2Form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{loginContent.step2.otpLabel}</FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} {...field} disabled={isLoading}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {apiError && (
                  <p className="text-sm text-destructive">{apiError}</p>
                )}
                <div className="space-y-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Vérification...
                      </>
                    ) : (
                      loginContent.step2.submitButton
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                  >
                    {loginContent.step2.resendLink}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {loginContent.step3.redirecting}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <LoginSuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
      />

      <LoginErrorDialog
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}
        errorMessage={apiError || undefined}
        onRetry={handleRetry}
      />
    </>
  );
};
