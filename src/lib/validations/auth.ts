import { z } from "zod";
import { validationMessages } from "@/content/landing/login";

export const emailOrPhoneSchema = z
  .string()
  .min(1, validationMessages.emailOrPhone.required)
  .refine(
    (value) => {
      // Check if it's a valid email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(value)) {
        return true;
      }
      // Check if it's a valid phone (format: +242XXXXXXXXX)
      const phoneRegex = /^\+242\d{9}$/;
      if (phoneRegex.test(value)) {
        return true;
      }
      return false;
    },
    {
      message: validationMessages.emailOrPhone.invalid,
    },
  );

export const otpSchema = z
  .string()
  .length(6, validationMessages.otp.length)
  .regex(/^[0-9A-Za-z]{6}$/, validationMessages.otp.invalid);

export type EmailOrPhoneFormData = z.infer<typeof emailOrPhoneSchema>;
export type OTPFormData = z.infer<typeof otpSchema>;
