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
  countryCode: z.string().min(1, validationMessages.country.required),
  countryName: z.string(),
  city: z.string().min(1, validationMessages.city.required),
  // Only the street-level remainder now that country and city are captured
  // separately, so the old 10-character floor no longer fits: "12 rue Foch"
  // is a complete address once the city is beside it.
  address: z
    .string()
    .min(4, validationMessages.address.min)
    .max(200, validationMessages.address.max),
  description: z
    .string()
    .min(80, validationMessages.description.min)
    .max(500, validationMessages.description.max),
});

/** Step 2 — profile type + categories (for all profile types) */
const step2SchemaBase = z.object({
  profileType: z.enum(["WORKER", "EMPLOYER"], {
    errorMap: () => ({ message: validationMessages.profileType.required }),
  }),
  categoryIds: z.array(z.string()).min(1, validationMessages.categoryId.required).max(5),
});

export const step2Schema = step2SchemaBase;

export { step2SchemaBase };

/** Step 3 — KYC documents */
const step3SchemaBase = z.object({
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

export const step3Schema = step3SchemaBase.refine(
  (data) => data.documentType !== "",
  {
    message: validationMessages.documentType.required,
    path: ["documentType"],
  }
);

export { step3SchemaBase };

export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export type Step3FormData = z.infer<typeof step3Schema>;
