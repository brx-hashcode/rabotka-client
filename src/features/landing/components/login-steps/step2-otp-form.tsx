import { useState, useCallback } from "react";
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
  isLoading: boolean;
  error: string | null;
};

const otpInputKeys = ["otp-0", "otp-1", "otp-2", "otp-3", "otp-4", "otp-5"];

export function Step2OTPForm({
  onSubmit,
  onResend,
  isLoading,
  error,
}: Readonly<Step2OTPFormProps>) {
  const [otpValues, setOtpValues] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const form = useForm<{ otp: string }>({
    resolver: zodResolver(z.object({ otp: otpSchema })),
    defaultValues: {
      otp: "",
    },
  });

  const handleOtpChange = useCallback(
    (index: number, value: string, fieldOnChange: (value: string) => void) => {
      const char = value.slice(-1).toUpperCase();
      if (char && /^[0-9A-Za-z]$/.test(char)) {
        const newOtpValues = [...otpValues];
        newOtpValues[index] = char;
        setOtpValues(newOtpValues);

        const otpString = newOtpValues.join("");
        fieldOnChange(otpString);

        if (index < 5 && char) {
          const nextInput = document.getElementById(`otp-input-${index + 1}`);
          nextInput?.focus();
        }
      } else if (value === "") {
        const newOtpValues = [...otpValues];
        newOtpValues[index] = "";
        setOtpValues(newOtpValues);

        const otpString = newOtpValues.join("");
        fieldOnChange(otpString);

        if (index > 0) {
          const prevInput = document.getElementById(`otp-input-${index - 1}`);
          prevInput?.focus();
        }
      }
    },
    [otpValues],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !otpValues[index] && index > 0) {
        const prevInput = document.getElementById(`otp-input-${index - 1}`);
        prevInput?.focus();
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
      const pastedData = e.clipboardData
        .getData("text")
        .slice(0, 6)
        .toUpperCase();
      if (/^[0-9A-Za-z]{0,6}$/.test(pastedData)) {
        const newOtpValues = [...otpValues];
        for (let i = 0; i < 6; i++) {
          newOtpValues[i] = pastedData[i] || "";
        }
        setOtpValues(newOtpValues);
        fieldOnChange(newOtpValues.join(""));

        const nextEmptyIndex = newOtpValues.findIndex((val) => !val);
        const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
        const nextInput = document.getElementById(`otp-input-${focusIndex}`);
        nextInput?.focus();
      }
    },
    [otpValues],
  );

  const handleResend = useCallback(async () => {
    setOtpValues(["", "", "", "", "", ""]);
    form.reset();
    await onResend();
    setTimeout(() => {
      const firstInput = document.getElementById("otp-input-0");
      firstInput?.focus();
    }, 100);
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
                        key={otpInputKeys[index]}
                        id={`otp-input-${index}`}
                        type="text"
                        maxLength={1}
                        value={value}
                        onChange={(e) =>
                          handleOtpChange(index, e.target.value, field.onChange)
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={(e) => handlePaste(e, field.onChange)}
                        disabled={isLoading}
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
        {error && <p className="text-sm text-destructive">{error}</p>}
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
            onClick={handleResend}
            disabled={isLoading}
          >
            {loginContent.step2.resendLink}
          </Button>
        </div>
      </form>
    </Form>
  );
}
