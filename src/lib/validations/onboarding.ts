import { z } from "zod";
import { validationMessages } from "@/content/onboarding";

export const step1Schema = z.object({
  firstName: z
    .string()
    .min(2, validationMessages.firstName.min)
    .max(50, validationMessages.firstName.max),
  lastName: z
    .string()
    .min(2, validationMessages.lastName.min)
    .max(50, validationMessages.lastName.max),
  email: z.string().email(validationMessages.email.invalid),
  phone: z.string().regex(/^\+242\d{9}$/, validationMessages.phone.invalid),
  address: z
    .string()
    .min(10, validationMessages.address.min)
    .max(200, validationMessages.address.max),
  description: z
    .string()
    .min(80, validationMessages.description.min)
    .max(500, validationMessages.description.max),
});

export const step2Schema = z.object({
  profileType: z.enum(["worker", "employer"], {
    errorMap: () => ({ message: validationMessages.profileType.required }),
  }),
  kycDocument: z.custom<File>(
    (file) => {
      if (!file || !(file instanceof File)) return false;
      if (file.size > 5 * 1024 * 1024) return false;
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      return validTypes.includes(file.type);
    },
    {
      message: validationMessages.kycDocument.invalid,
    }
  ),
  kycSelfie: z.custom<File>(
    (file) => {
      if (!file || !(file instanceof File)) return false;
      if (file.size > 5 * 1024 * 1024) return false;
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      return validTypes.includes(file.type);
    },
    {
      message: validationMessages.kycSelfie.invalid,
    }
  ),
});

export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
