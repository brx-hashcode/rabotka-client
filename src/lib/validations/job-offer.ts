import { z } from "zod";

export const PAYMENT_FLOW_VALUES = ["HOURLY", "DAILY", "MONTHLY"] as const;
export type PaymentFlowValue = (typeof PAYMENT_FLOW_VALUES)[number];

export const PAYMENT_FLOW_LABELS: Record<PaymentFlowValue, string> = {
  HOURLY: "Par heure",
  DAILY: "Par jour",
  MONTHLY: "Par mois",
};

// The date must be at least 4h in the future — mirrors the backend rule
// (MIN_SCHEDULED_HOURS_FROM_NOW in job-offer.service.ts).
const MIN_HOURS_AHEAD = 4;

export const createJobOfferSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Le titre doit contenir entre 5 et 100 caractères")
    .max(100, "Le titre doit contenir entre 5 et 100 caractères"),
  description: z
    .string()
    .trim()
    .min(20, "La description doit contenir entre 20 et 1000 caractères")
    .max(1000, "La description doit contenir entre 20 et 1000 caractères"),
  scheduledAt: z
    .string()
    .min(1, "La date est requise")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Date invalide")
    .refine(
      (v) => Date.parse(v) >= Date.now() + MIN_HOURS_AHEAD * 60 * 60 * 1000,
      "La date doit être au moins 4 heures dans le futur",
    ),
  address: z
    .string()
    .trim()
    .min(10, "L'adresse doit contenir au moins 10 caractères"),
  quantity: z.coerce
    .number({ invalid_type_error: "Nombre de personnes requis" })
    .int("Nombre entier requis")
    .min(1, "Au moins 1 personne requise")
    .max(100, "Maximum 100 personnes"),
  // Optional: empty string = not specified.
  amount: z
    .union([
      z.literal(""),
      z.coerce
        .number()
        .min(1_000, "Le montant minimum est 1 000 FCFA")
        .max(1_000_000, "Le montant maximum est 1 000 000 FCFA"),
    ])
    .optional(),
  paymentFlow: z.enum(PAYMENT_FLOW_VALUES).or(z.literal("")).optional(),
  note: z
    .string()
    .trim()
    .max(500, "La note ne doit pas dépasser 500 caractères")
    .optional(),
  categoryId: z.string().optional(),
});

export type CreateJobOfferFormData = z.infer<typeof createJobOfferSchema>;
