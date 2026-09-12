import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";
import { validationMessages } from "@/content/profile";

export const editProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, validationMessages.firstName.min)
    .max(50, validationMessages.firstName.max),
  lastName: z
    .string()
    .min(2, validationMessages.lastName.min)
    .max(50, validationMessages.lastName.max),
  countryCode: z.string().min(1, validationMessages.country.required),
  countryName: z.string(),
  city: z.string().min(1, validationMessages.city.required),
  // Street-level only now that country and city are their own fields; matches
  // the floor used in onboarding.
  address: z
    .string()
    .min(4, validationMessages.address.min)
    .max(200, validationMessages.address.max),
  description: z
    .string()
    .max(500, validationMessages.description.max)
    .optional()
    .default(""),
  categoryIds: z.array(z.string().uuid()).min(1).max(5).optional(),
  /**
   * Optional, and empty means absent rather than invalid — clearing the field
   * has to be a way to remove a number, not an error the user cannot resolve.
   *
   * The WhatsApp number is deliberately NOT here: it is the login identity and
   * changes through its own verify-then-switch flow, not by being submitted
   * with the rest of the form.
   */
  directPhone: z
    .string()
    .optional()
    .refine(
      (value) => !value || isValidPhoneNumber(value),
      validationMessages.directPhone.invalid,
    ),
  /**
   * Optional at signup, so this is where someone adds one later or drops one
   * that has gone stale. Same "empty means absent" rule as `directPhone`.
   *
   * Like the direct line and unlike the WhatsApp number, nothing authenticates
   * against an email address, so it changes by being submitted with the rest of
   * the form rather than through a verify-then-switch flow.
   */
  email: z
    .string()
    .optional()
    .refine(
      (value) => !value || z.string().email().safeParse(value).success,
      validationMessages.email.invalid,
    ),
});

export type EditProfileFormData = z.infer<typeof editProfileSchema>;
