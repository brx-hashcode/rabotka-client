import { z } from "zod";
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
});

export type EditProfileFormData = z.infer<typeof editProfileSchema>;
