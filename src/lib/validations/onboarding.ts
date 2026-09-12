import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";
import { validationMessages } from "@/content/onboarding";
import {
  KYC_DOCUMENT_TYPES,
  requiresBackSide,
} from "@/lib/kyc-document-types";

/**
 * Optional, and empty means absent rather than invalid.
 *
 * `PhoneInput` yields `undefined` for an untouched field but an empty string
 * once it has been focused and cleared, and both mean "no second number" — so
 * the format check has to run only on a non-empty value or clearing the field
 * would leave an error the user cannot resolve.
 */
const optionalPhone = z
  .string()
  .optional()
  .refine(
    (value) => !value || isValidPhoneNumber(value),
    validationMessages.directPhone.invalid,
  );

/**
 * Optional for the same reason, and cleared the same way.
 *
 * Most of the informal sector has a phone and no email address. Requiring one
 * did not produce email addresses — it produced invented ones that bounce. The
 * WhatsApp number is the identity signup actually proves, and every
 * notification goes there.
 *
 * The format check runs only on a non-empty value: an untouched input yields
 * "", and treating that as an invalid address would block onboarding at the
 * last step for exactly the people this change is meant to let in.
 */
const optionalEmail = z
  .string()
  .optional()
  .refine(
    (value) => !value || z.string().email().safeParse(value).success,
    validationMessages.email.invalid,
  );

export const step1Schema = z.object({
  firstName: z
    .string()
    .min(2, validationMessages.firstName.min)
    .max(50, validationMessages.firstName.max),
  lastName: z
    .string()
    .min(2, validationMessages.lastName.min)
    .max(50, validationMessages.lastName.max),
  email: optionalEmail,
  phone: z
    .string()
    .min(1, validationMessages.phone.required)
    .refine(isValidPhoneNumber, validationMessages.phone.invalid),
  directPhone: optionalPhone,
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
  /**
   * A floor low enough to be a typo guard, not a writing assignment.
   *
   * It was 80, which reads as "write a paragraph". Plenty of people describe
   * themselves in keywords — « maçon, finition, Pointe-Noire » — and that is
   * perfectly usable: the matching index embeds whatever is here, and short
   * keyword text still carries the trade and the place. Turning those people
   * away at the last field of onboarding cost more than the extra prose was
   * worth.
   */
  description: z
    .string()
    .min(5, validationMessages.description.min)
    .max(500, validationMessages.description.max),
})
  // A direct number identical to the WhatsApp one carries no information, and
  // saving it would make the profile claim two ways to be reached when there is
  // one. Reported on the field so the error lands under the input the user has
  // to change.
  .superRefine((data, ctx) => {
    if (data.directPhone && data.directPhone === data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validationMessages.directPhone.sameAsPhone,
        path: ["directPhone"],
      });
    }
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
