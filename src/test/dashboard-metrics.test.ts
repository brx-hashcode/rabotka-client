// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  countByStage,
  fillRate,
  monthlySpend,
  stageOf,
} from "@/features/employer/config/dashboard-metrics";
import { STAGE_ORDER } from "@/features/employer/config/chart-colors";
import type { EmployerJobOfferItem } from "@/lib/api/job-offer-controller";
import type { InvoiceItem } from "@/lib/api/profile-controller";

const offer = (
  status: EmployerJobOfferItem["status"],
  quantity = 1,
  acceptedCount = 0,
): EmployerJobOfferItem => ({
  id: Math.random().toString(36),
  title: "Offre",
  status,
  scheduledAt: "2026-08-01T00:00:00.000Z",
  amount: 10000,
  paymentFlow: "DAILY",
  address: "Brazzaville",
  quantity,
  acceptedCount,
  pendingApplicationsCount: 0,
  createdAt: "2026-07-01T00:00:00.000Z",
});

const invoice = (amount: string, createdAt: string): InvoiceItem => ({
  id: Math.random().toString(36),
  amount,
  reason: "CONTACT_UNLOCK",
  status: "DOWNLOADED",
  createdAt,
  relatedEntityType: null,
  relatedEntityId: null,
});

describe("stageOf", () => {
  it("folds the eight statuses into four decision-relevant stages", () => {
    expect(stageOf("ACTIVE")).toBe("open");
    expect(stageOf("PARTIALLY_FILLED")).toBe("open");
    expect(stageOf("FILLED")).toBe("staffed");
    expect(stageOf("IN_PROGRESS")).toBe("staffed");
    expect(stageOf("COMPLETED")).toBe("done");
    expect(stageOf("EXPIRED")).toBe("closed");
    expect(stageOf("CANCELLED")).toBe("closed");
  });

  it("excludes drafts, which are not part of the recruiting picture", () => {
    expect(stageOf("DRAFT")).toBeNull();
  });
});

describe("countByStage", () => {
  it("always returns every stage in validated slot order", () => {
    // Slot order is the colourblind-safety mechanism, so the stack must not be
    // reordered by whatever happens to be present in the data.
    const counts = countByStage([offer("ACTIVE")]);
    expect(counts.map((c) => c.stage)).toEqual([...STAGE_ORDER]);
  });

  it("keeps empty stages as zeroes rather than dropping them", () => {
    const counts = countByStage([offer("ACTIVE"), offer("ACTIVE")]);
    expect(counts).toEqual([
      { stage: "open", count: 2 },
      { stage: "staffed", count: 0 },
      { stage: "done", count: 0 },
      { stage: "closed", count: 0 },
    ]);
  });

  it("does not count drafts", () => {
    const counts = countByStage([offer("DRAFT"), offer("COMPLETED")]);
    expect(counts.reduce((n, c) => n + c.count, 0)).toBe(1);
  });
});

describe("fillRate", () => {
  it("counts positions across offers still recruiting or staffed", () => {
    const rate = fillRate([offer("ACTIVE", 7, 2), offer("FILLED", 2, 2)]);
    expect(rate).toEqual({ filled: 4, total: 9, ratio: 4 / 9 });
  });

  it("ignores finished and dead offers", () => {
    // Otherwise last quarter's completed work drags a "right now" metric.
    const rate = fillRate([
      offer("ACTIVE", 2, 0),
      offer("COMPLETED", 10, 10),
      offer("EXPIRED", 5, 0),
      offer("CANCELLED", 5, 0),
    ]);
    expect(rate).toEqual({ filled: 0, total: 2, ratio: 0 });
  });

  it("reports a zero ratio rather than dividing by zero", () => {
    expect(fillRate([])).toEqual({ filled: 0, total: 0, ratio: 0 });
    expect(fillRate([offer("COMPLETED", 3, 3)]).ratio).toBe(0);
  });
});

describe("monthlySpend", () => {
  const now = new Date(2026, 7, 15); // 15 Aug 2026

  it("returns a full trailing window, oldest first", () => {
    const points = monthlySpend([], 6, now);
    expect(points).toHaveLength(6);
    expect(points.map((p) => p.label)).toEqual([
      "mars", "avr.", "mai", "juin", "juil.", "août",
    ]);
  });

  it("sums invoices into their month", () => {
    const points = monthlySpend(
      [
        invoice("500", "2026-08-02T10:00:00.000Z"),
        invoice("1500", "2026-08-09T10:00:00.000Z"),
        invoice("300", "2026-07-20T10:00:00.000Z"),
      ],
      6,
      now,
    );
    expect(points.at(-1)).toMatchObject({ label: "août", total: 2000 });
    expect(points.at(-2)).toMatchObject({ label: "juil.", total: 300 });
  });

  it("keeps quiet months as zeroes instead of closing the gap", () => {
    // Dropping them would put unequal time steps on a time axis.
    const points = monthlySpend(
      [invoice("500", "2026-08-02T10:00:00.000Z")],
      6,
      now,
    );
    expect(points.filter((p) => p.total === 0)).toHaveLength(5);
  });

  it("ignores invoices outside the window and unparseable rows", () => {
    const points = monthlySpend(
      [
        invoice("900", "2020-01-01T00:00:00.000Z"),
        invoice("900", "not-a-date"),
        invoice("not-a-number", "2026-08-02T10:00:00.000Z"),
      ],
      6,
      now,
    );
    expect(points.reduce((n, p) => n + p.total, 0)).toBe(0);
  });
});
