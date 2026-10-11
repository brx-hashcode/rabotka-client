import type {
  CreateJobOfferPayload,
  JobOfferDetail,
  UpdateJobOfferPayload,
} from "@/lib/api/job-offer-controller";
import {
  composeScheduledAt,
  END_OF_DAY,
  toDateInput,
  toTimeInput,
} from "@/lib/scheduled-at";
import {
  PAYMENT_FLOW_VALUES,
  type CreateJobOfferFormData,
  type PaymentFlowValue,
} from "@/lib/validations/job-offer";

/** The form's empty state, for a new offer. */
export const EMPTY_JOB_OFFER_FORM: CreateJobOfferFormData = {
  title: "",
  description: "",
  employmentType: "MISSION",
  scheduledDate: "",
  scheduledTime: "",
  isRemote: false,
  countryCode: "",
  countryName: "",
  city: "",
  address: "",
  quantity: 1,
  amount: "",
  paymentFlow: "",
  note: "",
  categoryId: "",
};

/** The form's two date fields as the instant the server stores, or "". */
function scheduledAtIso(data: {
  scheduledDate?: string;
  scheduledTime?: string;
}): string {
  const local = composeScheduledAt(
    data.scheduledDate ?? "",
    data.scheduledTime ?? "",
  );
  return local ? new Date(local).toISOString() : "";
}

/** The form as the create payload. */
export function toCreatePayload(
  data: CreateJobOfferFormData,
): CreateJobOfferPayload {
  const scheduledAt = scheduledAtIso(data);
  return {
    title: data.title.trim(),
    description: data.description.trim(),
    employment_type: data.employmentType,
    quantity: data.quantity,
    // A remote job sends no location at all. Sending empty strings would
    // store a country the server then has to reject, and sending the fields
    // for an on-site job is what puts it in the right city.
    ...(data.isRemote
      ? { isRemote: true }
      : {
          isRemote: false,
          // Omitted rather than sent blank when there is none: "" would ask
          // the server to store an address that says nothing.
          ...(data.address.trim() ? { address: data.address.trim() } : {}),
          countryCode: data.countryCode,
          countryName: data.countryName,
          city: data.city,
        }),
    // Conditional: the two fields become one instant here, at the boundary —
    // a missing hour becomes the END of the chosen day, because "le 30" means
    // applications stay open through the 30th.
    ...(scheduledAt ? { scheduled_at: scheduledAt } : {}),
    ...(typeof data.amount === "number" ? { amount: data.amount } : {}),
    ...(data.paymentFlow ? { payment_flow: data.paymentFlow } : {}),
    ...(data.note?.trim() ? { note: data.note.trim() } : {}),
    category_id: data.categoryId,
  };
}

/**
 * The form as an edit of `initial`.
 *
 * Unlike creation, an emptied optional field is SENT empty — omitting it would
 * mean "leave it alone" and the old value would survive. The date and the type
 * go only when they changed: an unchanged date may now be closer than the 4h a
 * new one needs, and the type is locked server-side once anyone has applied.
 */
export function toUpdatePayload(
  data: CreateJobOfferFormData,
  initial: CreateJobOfferFormData,
): UpdateJobOfferPayload {
  const scheduledAt = scheduledAtIso(data);
  const dateChanged =
    composeScheduledAt(data.scheduledDate, data.scheduledTime) !==
    composeScheduledAt(initial.scheduledDate, initial.scheduledTime);
  return {
    title: data.title.trim(),
    description: data.description.trim(),
    quantity: data.quantity,
    ...(data.employmentType !== initial.employmentType
      ? { employment_type: data.employmentType }
      : {}),
    ...(data.isRemote
      ? { isRemote: true }
      : {
          isRemote: false,
          address: data.address.trim(),
          countryCode: data.countryCode,
          countryName: data.countryName,
          city: data.city,
        }),
    ...(dateChanged && scheduledAt ? { scheduled_at: scheduledAt } : {}),
    amount: typeof data.amount === "number" ? data.amount : null,
    payment_flow: data.paymentFlow ? data.paymentFlow : null,
    note: data.note?.trim() ?? "",
    category_id: data.categoryId,
  };
}

const isPaymentFlow = (v: string): v is PaymentFlowValue =>
  (PAYMENT_FLOW_VALUES as readonly string[]).includes(v);

/** An existing offer as the form's values, to prefill the edit. */
export function offerToFormValues(
  offer: JobOfferDetail,
): CreateJobOfferFormData {
  const at = offer.scheduledAt ? new Date(offer.scheduledAt) : null;
  const time = at ? toTimeInput(at) : "";
  return {
    title: offer.title,
    description: offer.description,
    employmentType: offer.employmentType,
    scheduledDate: at ? toDateInput(at) : "",
    // The end-of-day default was never an hour the employer chose: show it as
    // "no hour", so saving without touching it composes the same instant.
    scheduledTime: time === END_OF_DAY ? "" : time,
    isRemote: offer.isRemote,
    countryCode: offer.isRemote ? "" : (offer.countryCode ?? ""),
    countryName: offer.isRemote ? "" : (offer.countryName ?? ""),
    city: offer.isRemote ? "" : (offer.city ?? ""),
    address: offer.address ?? "",
    quantity: offer.quantity,
    amount: offer.amount ?? "",
    paymentFlow: isPaymentFlow(offer.paymentFlow) ? offer.paymentFlow : "",
    note: offer.note ?? "",
    categoryId: offer.categoryId ?? "",
  };
}
