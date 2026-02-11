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
  address: z
    .string()
    .min(10, validationMessages.address.min)
    .max(200, validationMessages.address.max),
  description: z
    .string()
    .max(500, validationMessages.description.max)
    .optional()
    .default(""),
});

export type EditProfileFormData = z.infer<typeof editProfileSchema>;
