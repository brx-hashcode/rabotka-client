import { useState, useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardPaste, Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { otpSchema } from "@/lib/validations/auth";
import { loginContent } from "@/content/landing/login";
import { extractOtpCode, OTP_LENGTH } from "@/lib/otp-code";

type Step2OTPFormProps = {
  onSubmit: (data: { otp: string }) => Promise<void>;
  onResend: () => Promise<void>;
  isVerifying: boolean;
  isResending: boolean;
  serverError: string | null;
};

const EMPTY_OTP = new Array<string>(OTP_LENGTH).fill("");
const OTP_INPUT_KEYS = EMPTY_OTP.map((_, i) => `otp-${i}`);
const OTP_CHAR_REGEX = /^\d$/;
const RESEND_COOLDOWN_SECONDS = 60;

const focusInput = (index: number) => {
  document.getElementById(`otp-input-${index}`)?.focus();
};

const isValidOtpChar = (char: string) => OTP_CHAR_REGEX.test(char);

/**
 * The clipboard can only be read on a tap, and not everywhere — WhatsApp's
 * in-app browser often lacks the API. No button where it cannot work.
 */
const canReadClipboard = () =>
  typeof navigator !== "undefined" &&
  typeof navigator.clipboard?.readText === "function";

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

export function Step2OTPForm({
  onSubmit,
  onResend,
  isVerifying,
  isResending,
  serverError,
}: Readonly<Step2OTPFormProps>) {
  const [otpValues, setOtpValues] = useState<string[]>([...EMPTY_OTP]);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [pasteHint, setPasteHint] = useState<string | null>(null);
  // The last code sent on its own: a complete code submits itself once, so a
  // wrong one does not loop — an edit makes a new code, and a new attempt.
  const autoSubmitted = useRef<string | null>(null);

  const form = useForm<{ otp: string }>({
    resolver: zodResolver(z.object({ otp: otpSchema })),
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    if (serverError) {
      form.setError("otp", { type: "server", message: serverError });
    }
  }, [serverError, form]);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const updateOtpValues = useCallback(
    (newValues: string[], fieldOnChange: (value: string) => void) => {
      setOtpValues(newValues);
      fieldOnChange(newValues.join(""));
      setPasteHint(null);
    },
    [],
  );

  /** All six boxes at once: a paste, a keyboard suggestion, the button. */
  const fillCode = useCallback(
    (code: string, fieldOnChange: (value: string) => void) => {
      updateOtpValues(code.split(""), fieldOnChange);
      focusInput(OTP_LENGTH - 1);
    },
    [updateOtpValues],
  );

  // Six digits in → verify, without a press on « Vérifier ». That is the
  // point of pasting: copy in WhatsApp, come back, one tap, done.
  useEffect(() => {
    const code = otpValues.join("");
    if (code.length !== OTP_LENGTH || !/^\d+$/.test(code)) return;
    if (isVerifying || isResending || autoSubmitted.current === code) return;
    autoSubmitted.current = code;
    void form.handleSubmit(onSubmit)();
  }, [otpValues, isVerifying, isResending, form, onSubmit]);

  const handleOtpChange = useCallback(
    (index: number, value: string, fieldOnChange: (value: string) => void) => {
      // A keyboard suggestion or an autofill drops the whole code into one
      // box (Gboard and Samsung offer the code just copied in WhatsApp).
      if (value.length > 1) {
        const code = extractOtpCode(value);
        if (code) {
          fillCode(code, fieldOnChange);
          return;
        }
      }

      const char = value.slice(-1);

      if (char && isValidOtpChar(char)) {
        const newValues = [...otpValues];
        newValues[index] = char;
        updateOtpValues(newValues, fieldOnChange);

        if (index < OTP_LENGTH - 1) {
          focusInput(index + 1);
        }
      } else if (value === "") {
        const newValues = [...otpValues];
        newValues[index] = "";
        updateOtpValues(newValues, fieldOnChange);

        if (index > 0) {
          focusInput(index - 1);
        }
      }
    },
    [otpValues, updateOtpValues, fillCode],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !otpValues[index] && index > 0) {
        focusInput(index - 1);
      }
    },
    [otpValues],
  );

  const handlePaste = useCallback(
    (
      e: React.ClipboardEvent<HTMLInputElement>,
      fieldOnChange: (value: string) => void,
    ) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text");
      // The bare code, « 123 456 », or the whole WhatsApp message.
      const code = extractOtpCode(pasted);
      if (code) {
        fillCode(code, fieldOnChange);
        return;
      }
      const pastedData = pasted.trim().slice(0, OTP_LENGTH);

      const isValidPaste = pastedData
        .split("")
        .every((char) => isValidOtpChar(char));
      if (!isValidPaste && pastedData) {
        return;
      }

      const newValues = EMPTY_OTP.map((_, i) => pastedData[i] || "");
      updateOtpValues(newValues, fieldOnChange);

      const nextEmptyIndex = newValues.findIndex((val) => !val);
      focusInput(nextEmptyIndex === -1 ? OTP_LENGTH - 1 : nextEmptyIndex);
    },
    [updateOtpValues, fillCode],
  );

  /**
   * « Coller le code »: read the clipboard on this tap only (iOS shows its
   * own paste confirmation), keep the six digits, fill and submit.
   */
  const handlePasteButton = useCallback(async () => {
    try {
      const code = extractOtpCode(await navigator.clipboard.readText());
      if (!code) {
        setPasteHint(loginContent.step2.pasteEmpty);
        return;
      }
      fillCode(code, (value) => form.setValue("otp", value));
    } catch {
      // Refused or unavailable: the person can still long-press to paste.
      setPasteHint(loginContent.step2.pasteEmpty);
    }
  }, [fillCode, form]);

  const handleResend = useCallback(async () => {
    setOtpValues([...EMPTY_OTP]);
    autoSubmitted.current = null;
    form.reset();
    await onResend();
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    setTimeout(() => focusInput(0), 100);
  }, [form, onResend]);

  const getResendButtonText = useCallback(() => {
    if (isResending) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Envoi...
        </>
      );
    }

    if (resendCooldown > 0) {
      return `Renvoyer dans (${formatTime(resendCooldown)})`;
    }

    return loginContent.step2.resendButton;
  }, [isResending, resendCooldown]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex flex-col items-center gap-4 w-full">
                  <div className="flex gap-4 w-full justify-center">
                    {otpValues.map((value, index) => (
                      <Input
                        key={OTP_INPUT_KEYS[index]}
                        id={`otp-input-${index}`}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        // No maxLength: a suggested code arrives whole in one
                        // box and is spread across the six (handleOtpChange).
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        value={value}
                        onChange={(e) =>
                          handleOtpChange(index, e.target.value, field.onChange)
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={(e) => handlePaste(e, field.onChange)}
                        disabled={isVerifying || isResending}
                        className="w-full md:h-12 h-10 aspect-square text-center text-base md:text-2xl font-black"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {canReadClipboard() && (
          <div className="space-y-1">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => void handlePasteButton()}
              disabled={isVerifying || isResending}
            >
              <ClipboardPaste className="mr-2 h-4 w-4" />
              {loginContent.step2.pasteButton}
            </Button>
            {pasteHint && (
              <p className="text-center text-xs text-muted-foreground">
                {pasteHint}
              </p>
            )}
          </div>
        )}
        <div className="space-y-2">
          <Button
            type="submit"
            className="w-full"
            disabled={isVerifying || isResending}
          >
            {isVerifying ? (
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
            onClick={handleResend}
            disabled={isVerifying || isResending || resendCooldown > 0}
          >
            {getResendButtonText()}
          </Button>
        </div>
      </form>
    </Form>
  );
}
