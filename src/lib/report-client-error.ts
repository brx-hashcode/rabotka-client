import { config } from "@/config";
import { sanitizePath } from "@/lib/analytics/sanitize-path";

/** Caps mirror the backend DTO, which rejects anything longer with a 400. */
const MAX = { name: 200, message: 1000, stack: 4000, path: 500 } as const;

export type ClientErrorReport = {
  name: string;
  message: string;
  stack?: string;
  componentStack?: string;
  path: string;
  version: string;
};

const clip = (value: string, max: number) =>
  value.length > max ? value.slice(0, max) : value;

/**
 * The report for one render error, shaped and truncated for the backend.
 *
 * The path goes through `sanitizePath` like any other reported path: several
 * routes carry a working credential (`/pay/:token`, `/s/:code`), and a log line
 * is no place for one.
 */
export function buildClientErrorReport(
  error: unknown,
  componentStack: string | null | undefined,
  pathname: string,
  version: string,
): ClientErrorReport {
  const err =
    error instanceof Error ? error : new Error(String(error ?? "Unknown error"));
  return {
    name: clip(err.name || "Error", MAX.name),
    message: clip(err.message || "(no message)", MAX.message),
    ...(err.stack ? { stack: clip(err.stack, MAX.stack) } : {}),
    ...(componentStack
      ? { componentStack: clip(componentStack.trim(), MAX.stack) }
      : {}),
    path: clip(sanitizePath(pathname), MAX.path),
    version: clip(version, 50),
  };
}

/**
 * Sends a render error to the backend, where it becomes a log line.
 *
 * The app runs mostly inside WhatsApp's in-app browser, which has no devtools —
 * without this a crash is visible only as "Une erreur est survenue".
 *
 * `sendBeacon` because the next thing the user does is often a reload, and a
 * beacon survives the unload where a pending fetch would be cancelled. It
 * cannot carry headers, which is why the endpoint is CSRF-exempt. Never throws:
 * this runs inside an error boundary, and a failing report must not become a
 * second crash.
 */
export function reportClientError(report: ClientErrorReport): void {
  try {
    const url = `${config.apiUrl}/client-errors`;
    const body = JSON.stringify(report);
    const blob = new Blob([body], { type: "application/json" });
    if (globalThis.navigator?.sendBeacon?.(url, blob)) return;
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => {});
  } catch {
    // Reporting is best-effort; the error screen is what matters.
  }
}
