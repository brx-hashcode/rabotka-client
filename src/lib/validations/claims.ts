import { z } from "zod";

export const createClaimSchema = z.object({
  title: z.string().min(1, "Titre requis").max(200, "Titre trop long"),
  description: z
    .string()
    .min(10, "Description doit contenir au moins 10 caractères")
    .max(2000, "Description trop longue"),
});

export type CreateClaimFormData = z.infer<typeof createClaimSchema>;
