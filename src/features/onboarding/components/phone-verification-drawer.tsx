import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Step2OTPForm } from "@/features/landing/components/login-steps";
import { phoneVerificationContent as content } from "@/content/onboarding";
import {
  sendSignupOtp,
  verifySignupOtp,
} from "@/lib/api/profile-controller";
import {
  normalizeSignupPhone,
  type SignupVerification,
} from "@/lib/signup-verification";

type Props = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly phone: string;
  readonly onVerified: (verification: SignupVerification) => void;
};

const errorText = (error: unknown) =>
  error instanceof Error && error.message ? error.message : content.sendFailed;

/**
 * The WhatsApp code check that ends signup step 1. The API requires its token
 * before any document can be uploaded or the account created, so nobody can
 * register a number they do not hold.
 *
 * Sends the code as soon as it opens; the same 6-digit form as the login.
 */
export function PhoneVerificationDrawer({
  open,
  onOpenChange,
  phone,
  onVerified,
}: Props) {
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const send = useCallback(async () => {
    setSending(true);
    setSendError(null);
    try {
      await sendSignupOtp(phone);
    } catch (error) {
      setSendError(errorText(error));
    } finally {
      setSending(false);
    }
  }, [phone]);

  // One code per opening; the form's own button handles resends.
  useEffect(() => {
    if (!open) return;
    setVerifyError(null);
    void send();
  }, [open, send]);

  const verify = async ({ otp }: { otp: string }) => {
    setVerifying(true);
    setVerifyError(null);
    try {
      const { signupToken, expiresIn } = await verifySignupOtp(phone, otp);
      onVerified({
        token: signupToken,
        phone: normalizeSignupPhone(phone),
        expiresAt: Date.now() + expiresIn * 1000,
      });
    } catch (error) {
      setVerifyError(errorText(error));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full">
          <DrawerHeader className="text-center">
            <DrawerTitle>{content.title}</DrawerTitle>
            <DrawerDescription>{content.description(phone)}</DrawerDescription>
          </DrawerHeader>

          <div className="px-6 pb-6">
            {sending && (
              <p className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                {content.sending}
              </p>
            )}

            {!sending && sendError && (
              <div className="space-y-4 py-2 text-center">
                <p className="text-sm text-destructive">{sendError}</p>
                <div className="flex flex-col gap-2">
                  <Button onClick={() => void send()}>{content.retry}</Button>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    {content.close}
                  </Button>
                </div>
              </div>
            )}

            {!sending && !sendError && (
              <Step2OTPForm
                onSubmit={verify}
                onResend={send}
                isVerifying={verifying}
                isResending={sending}
                serverError={verifyError}
              />
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
