import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";
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
  phone: z
    .string()
    .min(1, validationMessages.phone.required)
    .refine(isValidPhoneNumber, validationMessages.phone.invalid),
  address: z
    .string()
    .min(10, validationMessages.address.min)
    .max(200, validationMessages.address.max),
  description: z
    .string()
    .min(80, validationMessages.description.min)
    .max(500, validationMessages.description.max),
});

const step2SchemaBase = z.object({
  profileType: z.enum(["WORKER", "EMPLOYER"], {
    errorMap: () => ({ message: validationMessages.profileType.required }),
  }),
  documentType: z.union([
    z.enum([
      "IDENTITY_CARD",
      "PASSPORT",
      "DRIVER_LICENSE",
      "BIRTH_CERTIFICATE",
      "STUDENT_CARD",
      "NIU_CARD",
      "OTHER",
    ]),
    z.literal(""),
  ]),
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

export const step2Schema = step2SchemaBase.refine(
  (data) => data.documentType !== "",
  {
    message: validationMessages.documentType.required,
    path: ["documentType"],
  }
);

/** Base schema for step 2 (use .shape for field-level validation). */
export { step2SchemaBase };

export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
