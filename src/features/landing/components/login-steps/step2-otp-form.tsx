import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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

type Step2OTPFormProps = {
  onSubmit: (data: { otp: string }) => Promise<void>;
  onResend: () => Promise<void>;
  isVerifying: boolean;
  isResending: boolean;
  serverError: string | null;
};

const OTP_LENGTH = 6;
const EMPTY_OTP = new Array<string>(OTP_LENGTH).fill("");
const OTP_INPUT_KEYS = EMPTY_OTP.map((_, i) => `otp-${i}`);
const OTP_CHAR_REGEX = /^\d$/;

const focusInput = (index: number) => {
  document.getElementById(`otp-input-${index}`)?.focus();
};

const isValidOtpChar = (char: string) => OTP_CHAR_REGEX.test(char);

export function Step2OTPForm({
  onSubmit,
  onResend,
  isVerifying,
  isResending,
  serverError,
}: Readonly<Step2OTPFormProps>) {
  const [otpValues, setOtpValues] = useState<string[]>([...EMPTY_OTP]);

  const form = useForm<{ otp: string }>({
    resolver: zodResolver(z.object({ otp: otpSchema })),
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    if (serverError) {
      form.setError("otp", { type: "server", message: serverError });
    }
  }, [serverError, form]);

  const updateOtpValues = useCallback(
    (newValues: string[], fieldOnChange: (value: string) => void) => {
      setOtpValues(newValues);
      fieldOnChange(newValues.join(""));
    },
    [],
  );

  const handleOtpChange = useCallback(
    (index: number, value: string, fieldOnChange: (value: string) => void) => {
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
    [otpValues, updateOtpValues],
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
      const pastedData = e.clipboardData.getData("text").slice(0, OTP_LENGTH);

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
    [updateOtpValues],
  );

  const handleResend = useCallback(async () => {
    setOtpValues([...EMPTY_OTP]);
    form.reset();
    await onResend();
    setTimeout(() => focusInput(0), 100);
  }, [form, onResend]);

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
                        maxLength={1}
                        value={value}
                        onChange={(e) =>
                          handleOtpChange(index, e.target.value, field.onChange)
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={(e) => handlePaste(e, field.onChange)}
                        disabled={isVerifying || isResending}
                        className="w-full h-12 text-center text-5xl font-black"
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
            disabled={isVerifying || isResending}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi...
              </>
            ) : (
              loginContent.step2.resendLink
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
