import { z } from "zod";

export const step1Schema = z.object({
  firstName: z
    .string()
    .min(2, "Minimum 2 caractères")
    .max(50, "Maximum 50 caractères"),
  lastName: z
    .string()
    .min(2, "Minimum 2 caractères")
    .max(50, "Maximum 50 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().regex(/^\+242\d{9}$/, "Format: +242XXXXXXXXX"),
  address: z
    .string()
    .min(10, "Adresse trop courte")
    .max(200, "Adresse trop longue"),
  description: z
    .string()
    .min(20, "Minimum 20 caractères")
    .max(500, "Maximum 500 caractères"),
});

export const step2Schema = z.object({
  profileType: z.enum(["worker", "employer"], {
    errorMap: () => ({ message: "Sélectionnez un type de profil" }),
  }),
  kycDocument: z.custom<File>(
    (file) => {
      if (!file || !(file instanceof File)) return false;
      if (file.size > 5 * 1024 * 1024) return false; // 5MB
      const validTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];
      return validTypes.includes(file.type);
    },
    {
      message: "Document invalide (PDF, JPG, PNG - Max 5MB)",
    }
  ),
  kycSelfie: z.custom<File>(
    (file) => {
      if (!file || !(file instanceof File)) return false;
      if (file.size > 5 * 1024 * 1024) return false; // 5MB
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      return validTypes.includes(file.type);
    },
    {
      message: "Selfie invalide (JPG, PNG - Max 5MB)",
    }
  ),
});

export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
