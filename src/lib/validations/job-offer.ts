import { z } from "zod";
import { EMPLOYMENT_TYPE_VALUES, isDatedMission } from "@/lib/employment-type";
import { composeScheduledAt } from "@/lib/scheduled-at";

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
  employmentType: z.enum(EMPLOYMENT_TYPE_VALUES).default("MISSION"),
  /**
   * The day, `YYYY-MM-DD`. Required — checked in the superRefine below, which
   * is the only place that can see `employmentType` alongside it, because the
   * message has to name the right thing: asking for "la date de la mission" on
   * a CDI is how you get an employer inventing one.
   */
  scheduledDate: z.string().default(""),
  /**
   * The hour, `HH:mm`, or "" for none — OPTIONAL.
   *
   * Its own field rather than half of a `datetime-local` string: an employer
   * often knows the day and settles the time with whoever answers, and there
   * is no way to leave the hour out of a single combined value without
   * inventing a sentinel that a native time input can then type.
   */
  scheduledTime: z.string().default(""),
  isRemote: z.boolean().default(false),
  countryCode: z.string().default(""),
  countryName: z.string().default(""),
  city: z.string().default(""),
  /**
   * NEVER REQUIRED — only well-formed when given. See the superRefine.
   *
   * It used to be mandatory for on-site work, which assumed on-site means the
   * worker travels to a street address. Most of the informal work here is the
   * other way round: a tailor, a mechanic, a hairdresser works at their own
   * place and the client comes to them.
   */
  address: z.string().trim().default(""),
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
  // Required: the trade is what decides who hears about the offer. Without it
  // the suggestions could only guess from the title. « Autre » remains.
  categoryId: z.string().min(1, "Choisissez un domaine"),
})
  /**
   * The city and country are required only for on-site work.
   *
   * As a superRefine rather than per-field rules because the requirement spans
   * several fields and one flag — no single field can decide on its own whether
   * it is needed, and expressing it here is what keeps a remote job from being
   * blocked by a location it will never have.
   */
  .superRefine((data, ctx) => {
    // Every type needs this date — it is the day the offer stops being open.
    // Only what it *means* changes: the day of the work on a MISSION, the
    // application deadline on the rest. Checked here rather than on the field
    // because this is the only place that can see employmentType alongside it,
    // and the message has to name the right one: asking for "la date de la
    // mission" on a CDI is how you get an employer inventing one.
    if (!data.scheduledDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduledDate"],
        message: isDatedMission(data.employmentType)
          ? "La date de la mission est requise"
          : "La date de clôture des candidatures est requise",
      });
    } else {
      const instant = Date.parse(
        composeScheduledAt(data.scheduledDate, data.scheduledTime),
      );
      if (Number.isNaN(instant)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["scheduledDate"],
          message: "Date invalide",
        });
      } else if (instant < Date.now() + MIN_HOURS_AHEAD * 60 * 60 * 1000) {
        // Blamed on whichever field the person can act on. With an hour given
        // it is usually the hour that is too early — pointing at the date
        // would have them change a day that was fine.
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [data.scheduledTime ? "scheduledTime" : "scheduledDate"],
          message: "La date doit être au moins 4 heures dans le futur",
        });
      }
    }

    // Checked for EVERY offer, remote or not, because the rule is about the
    // text and not about the site: an address may be left out, but half an
    // address helps nobody. Mirrors the server, which validates the same way.
    const address = data.address.trim();
    if (address.length > 0 && address.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["address"],
        message: "L'adresse doit contenir au moins 10 caractères",
      });
    }

    // The country and city are still required on site. They are what the
    // proximity term reads — an offer with neither an address nor a city is
    // an offer nobody can be matched to.
    if (data.isRemote) return;

    if (!data.countryCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["countryCode"],
        message: "Sélectionnez un pays",
      });
    }
    if (!data.city) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["city"],
        message: "Sélectionnez une ville",
      });
    }
  });

export type CreateJobOfferFormData = z.infer<typeof createJobOfferSchema>;
