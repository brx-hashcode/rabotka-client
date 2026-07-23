import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";
import { validationMessages } from "@/content/landing/login";

export const phoneSchema = z
  .string()
  .min(1, validationMessages.phone.required)
  .refine(isValidPhoneNumber, validationMessages.phone.invalid);

export const otpSchema = z
  .string()
  .length(6, validationMessages.otp.length)
  .regex(/^[0-9A-Za-z]{6}$/, validationMessages.otp.invalid);

export type PhoneFormData = z.infer<typeof phoneSchema>;
export type OTPFormData = z.infer<typeof otpSchema>;
