import type { CreateJobOfferFormData } from "@/lib/validations/job-offer";

type Field = keyof CreateJobOfferFormData;

/**
 * The offer form, in three short screens rather than one 13-field scroll.
 *
 * "Domaine" is on the first one, next to the title, on purpose: it is required
 * and it is what matching runs on, but it used to sit second to last, under
 * three optional fields — the one answer that mattered most was the one most
 * often reached last.
 */
export const JOB_OFFER_STEPS: readonly {
  readonly title: string;
  readonly fields: readonly Field[];
}[] = [
  { title: "L'offre", fields: ["title", "description", "categoryId", "employmentType"] },
  {
    title: "Quand et où",
    fields: [
      "scheduledDate",
      "scheduledTime",
      "isRemote",
      "countryCode",
      "countryName",
      "city",
      "address",
    ],
  },
  { title: "Rémunération", fields: ["quantity", "amount", "paymentFlow", "note"] },
];

/**
 * The first step holding an error, for a submit refused on the last screen —
 * the date can go stale while the employer fills in the amount.
 */
export function stepOfFirstError(errors: Partial<Record<string, unknown>>): number {
  const index = JOB_OFFER_STEPS.findIndex((step) =>
    step.fields.some((field) => errors[field] != null),
  );
  return index === -1 ? JOB_OFFER_STEPS.length - 1 : index;
}

/**
 * A new offer, saved as it is typed. Losing it was easy: a dropped connection,
 * a switch to WhatsApp to check a detail and the tab reloaded on return. Per
 * profile, so a shared phone never offers one employer another's draft.
 *
 * Kept a week. Older than that it is an abandoned offer, not a draft.
 */
const DRAFT_VERSION = 1;
const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type StoredDraft = {
  v: number;
  savedAt: number;
  values: Partial<CreateJobOfferFormData>;
};

export function jobOfferDraftKey(profileId: string): string {
  return `rabotka:job-offer-draft:${profileId}`;
}

/** The saved draft over `empty`, or null when there is none worth offering. */
export function readJobOfferDraft(
  storage: Pick<Storage, "getItem">,
  key: string,
  empty: CreateJobOfferFormData,
  now: number = Date.now(),
): CreateJobOfferFormData | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const draft = JSON.parse(raw) as StoredDraft;
    if (draft.v !== DRAFT_VERSION || now - draft.savedAt > DRAFT_MAX_AGE_MS)
      return null;
    const values = { ...empty, ...draft.values };
    return isEmptyDraft(values, empty) ? null : values;
  } catch {
    return null;
  }
}

export function writeJobOfferDraft(
  storage: Pick<Storage, "setItem" | "removeItem">,
  key: string,
  values: CreateJobOfferFormData,
  empty: CreateJobOfferFormData,
  now: number = Date.now(),
): void {
  try {
    if (isEmptyDraft(values, empty)) {
      storage.removeItem(key);
      return;
    }
    const draft: StoredDraft = { v: DRAFT_VERSION, savedAt: now, values };
    storage.setItem(key, JSON.stringify(draft));
  } catch {
    // Private mode, a full quota: the form still works, just without a draft.
  }
}

export function clearJobOfferDraft(
  storage: Pick<Storage, "removeItem">,
  key: string,
): void {
  try {
    storage.removeItem(key);
  } catch {
    /* see writeJobOfferDraft */
  }
}

/** Nothing typed yet — the defaults alone are not a draft. */
function isEmptyDraft(
  values: CreateJobOfferFormData,
  empty: CreateJobOfferFormData,
): boolean {
  return (Object.keys(empty) as Field[]).every(
    (field) => String(values[field] ?? "") === String(empty[field] ?? ""),
  );
}
