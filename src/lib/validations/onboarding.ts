import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";
import { validationMessages } from "@/content/onboarding";
import {
  KYC_DOCUMENT_TYPES,
  requiresBackSide,
} from "@/lib/kyc-document-types";

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
  documentType: z.union([z.enum(KYC_DOCUMENT_TYPES), z.literal("")]),
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
  // Optional on the base object on purpose: whether a back is required depends
  // on documentType, and that rule lives in the superRefine below. Keeping the
  // base flat also keeps `step3SchemaBase.shape[fieldName]` usable — the upload
  // form indexes it to validate each file as it is picked.
  kycDocumentBack: z
    .custom<File>(
      (file) => {
        if (!file || !(file instanceof File)) return false;
        if (file.size > 5 * 1024 * 1024) return false;
        const validTypes = ["image/jpeg", "image/jpg", "image/png"];
        return validTypes.includes(file.type);
      },
      {
        message: validationMessages.kycDocumentBack.invalid,
      }
    )
    .nullish(),
});

export const step3Schema = step3SchemaBase.superRefine((data, ctx) => {
  if (data.documentType === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: validationMessages.documentType.required,
      path: ["documentType"],
    });
    return;
  }

  // Everything but a passport splits its data across two sides, so the front
  // alone cannot be verified. Reported on the field so the error lands under
  // the verso upload zone rather than at the top of the form.
  if (requiresBackSide(data.documentType) && !data.kycDocumentBack) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: validationMessages.kycDocumentBack.required,
      path: ["kycDocumentBack"],
    });
  }
});

export { step3SchemaBase };

export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export type Step3FormData = z.infer<typeof step3Schema>;
