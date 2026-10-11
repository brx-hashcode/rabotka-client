// @vitest-environment node
// The offer form's mapping to and from the API, and the edit's date rule.
import { describe, expect, it } from "vitest";

import type { JobOfferDetail } from "@/lib/api/job-offer-controller";
import {
  EMPTY_JOB_OFFER_FORM,
  offerToFormValues,
  toCreatePayload,
  toUpdatePayload,
} from "@/lib/job-offer-form";
import { composeScheduledAt, toDateInput } from "@/lib/scheduled-at";
import { jobOfferSchema } from "@/lib/validations/job-offer";

const inHours = (h: number) => new Date(Date.now() + h * 60 * 60 * 1000);

const offer = (over: Partial<JobOfferDetail> = {}): JobOfferDetail => ({
  id: "o-1",
  reference: "RBT-ABCDE",
  title: "Plombier pour réparation",
  description: "Une description suffisamment longue pour passer la validation.",
  status: "ACTIVE",
  scheduledAt: new Date(2026, 10, 20, 9, 30).toISOString(),
  employmentType: "MISSION",
  amount: 15000,
  paymentFlow: "DAILY",
  address: "12 avenue de la Paix",
  isRemote: false,
  countryName: "Congo",
  countryCode: "CG",
  city: "Brazzaville",
  categoryId: "cat-1",
  note: "Apporter ses outils",
  quantity: 2,
  acceptedCount: 0,
  createdAt: new Date().toISOString(),
  ...over,
});

describe("offerToFormValues", () => {
  it("splits the date back into the two fields, in local time", () => {
    const values = offerToFormValues(offer());
    expect(values.scheduledDate).toBe("2026-11-20");
    expect(values.scheduledTime).toBe("09:30");
    expect(values.categoryId).toBe("cat-1");
    expect(values.countryCode).toBe("CG");
    expect(values.paymentFlow).toBe("DAILY");
  });

  it("shows the end-of-day default as no hour, so it round-trips", () => {
    const values = offerToFormValues(
      offer({ scheduledAt: new Date(2026, 10, 20, 23, 59).toISOString() }),
    );
    expect(values.scheduledTime).toBe("");
    expect(composeScheduledAt(values.scheduledDate, values.scheduledTime)).toBe(
      "2026-11-20T23:59",
    );
  });

  it("leaves the location empty for a remote offer", () => {
    const values = offerToFormValues(
      offer({ isRemote: true, address: null, city: null, countryCode: null }),
    );
    expect(values).toMatchObject({ isRemote: true, city: "", countryCode: "" });
  });

  it("maps a missing amount and an unknown pay rhythm to empty", () => {
    const values = offerToFormValues(offer({ amount: null, paymentFlow: "" }));
    expect(values.amount).toBe("");
    expect(values.paymentFlow).toBe("");
  });
});

describe("toUpdatePayload", () => {
  const initial = offerToFormValues(offer());

  it("does not resend an unchanged date or type", () => {
    const payload = toUpdatePayload({ ...initial, title: "Nouveau" }, initial);
    expect(payload).not.toHaveProperty("scheduled_at");
    expect(payload).not.toHaveProperty("employment_type");
    expect(payload.title).toBe("Nouveau");
  });

  it("sends a changed date as an ISO instant", () => {
    const payload = toUpdatePayload(
      { ...initial, scheduledDate: "2026-11-21" },
      initial,
    );
    expect(payload.scheduled_at).toBe(
      new Date("2026-11-21T09:30").toISOString(),
    );
  });

  it("sends emptied optional fields as empty, so they are cleared", () => {
    const payload = toUpdatePayload(
      { ...initial, amount: "", paymentFlow: "", note: "", address: "" },
      initial,
    );
    expect(payload).toMatchObject({
      amount: null,
      payment_flow: null,
      note: "",
      address: "",
    });
  });

  it("sends no location for a remote offer", () => {
    const payload = toUpdatePayload({ ...initial, isRemote: true }, initial);
    expect(payload.isRemote).toBe(true);
    expect(payload).not.toHaveProperty("city");
    expect(payload).not.toHaveProperty("address");
  });
});

describe("toCreatePayload", () => {
  it("omits what was left empty", () => {
    const payload = toCreatePayload({
      ...EMPTY_JOB_OFFER_FORM,
      title: " Plombier ",
      scheduledDate: "2026-11-20",
      categoryId: "cat-1",
    });
    expect(payload.title).toBe("Plombier");
    expect(payload.scheduled_at).toBe(
      new Date("2026-11-20T23:59").toISOString(),
    );
    expect(payload).not.toHaveProperty("amount");
    expect(payload).not.toHaveProperty("address");
    expect(payload).not.toHaveProperty("note");
  });
});

describe("jobOfferSchema keepSchedule", () => {
  const soon = inHours(1);
  const values = {
    ...offerToFormValues(offer({ scheduledAt: soon.toISOString() })),
  };
  const kept = composeScheduledAt(values.scheduledDate, values.scheduledTime);

  it("accepts keeping a date that is now less than 4h away", () => {
    expect(jobOfferSchema({ keepSchedule: kept }).safeParse(values).success).toBe(
      true,
    );
  });

  it("still refuses a NEW date less than 4h away", () => {
    const later = inHours(2);
    const moved = {
      ...values,
      scheduledDate: toDateInput(later),
      scheduledTime: `${String(later.getHours()).padStart(2, "0")}:${String(later.getMinutes()).padStart(2, "0")}`,
    };
    expect(jobOfferSchema({ keepSchedule: kept }).safeParse(moved).success).toBe(
      false,
    );
  });

  it("refuses it on creation", () => {
    expect(jobOfferSchema().safeParse(values).success).toBe(false);
  });
});
