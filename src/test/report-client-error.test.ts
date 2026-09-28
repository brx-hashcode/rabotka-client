// @vitest-environment node
import { describe, expect, it } from "vitest";

import { buildClientErrorReport } from "@/lib/report-client-error";

/**
 * The report is sent from inside the error boundary to a public endpoint whose
 * DTO rejects oversize fields with a 400 — so a report that is too long is a
 * report that never arrives. And it is logged, so no credential may ride along.
 */
describe("buildClientErrorReport", () => {
  it("carries the error and the route shape, not the route values", () => {
    const report = buildClientErrorReport(
      new TypeError("Cannot read properties of undefined (reading 'title')"),
      "\n    at ApplicationPaymentInner\n    at AppShell",
      "/pay/9f2b8c1d4e",
      "1.2.3",
    );
    expect(report).toMatchObject({
      name: "TypeError",
      message: "Cannot read properties of undefined (reading 'title')",
      // A payment token in a log line is a working credential in a log line.
      path: "/pay/:token",
      version: "1.2.3",
      componentStack: "at ApplicationPaymentInner\n    at AppShell",
    });
    expect(report.stack).toContain("TypeError");
  });

  it("clips every field to what the backend accepts", () => {
    const err = new Error("m".repeat(5000));
    err.stack = "s".repeat(9000);
    const report = buildClientErrorReport(err, "c".repeat(9000), "/home", "v");
    expect(report.message).toHaveLength(1000);
    expect(report.stack).toHaveLength(4000);
    expect(report.componentStack).toHaveLength(4000);
  });

  it("survives something thrown that is not an Error", () => {
    // `throw "boom"` and `throw undefined` both reach a boundary.
    expect(buildClientErrorReport("boom", null, "/home", "v")).toMatchObject({
      name: "Error",
      message: "boom",
    });
    const fromUndefined = buildClientErrorReport(undefined, null, "/home", "v");
    expect(fromUndefined.message).toBe("Unknown error");
    expect(fromUndefined).not.toHaveProperty("componentStack");
  });
});
