import { onlineManager } from "@tanstack/react-query";

/**
 * Whether the app can reach its server — learned from the requests themselves,
 * not from `navigator.onLine`.
 *
 * The browser's flag lies in exactly the places this app is used: on a weak
 * 2G signal, behind a captive portal, in some in-app browsers, it says
 * "online" while every request fails. So a request that gets no response at
 * all marks the app offline: TanStack Query then pauses fetches and their
 * retries instead of failing them, and screens keep their stored data. A tiny
 * same-origin file is then tried every PROBE_MS, and on the browser's own
 * `online` event, until something answers.
 */
const PROBE_MS = 15_000;
/** Static, tiny, and never served by the service worker (sw.js bypasses it). */
const PROBE_URL = "/offline-manifest.json";

let probeTimer: ReturnType<typeof setInterval> | undefined;

async function probe(): Promise<void> {
  try {
    // Any response at all means the network is back — even a 404 (dev).
    await fetch(`${PROBE_URL}?_=${Date.now()}`, { method: "HEAD", cache: "no-store" });
    markOnline();
  } catch {
    /* still offline */
  }
}

function markOnline() {
  clearInterval(probeTimer);
  probeTimer = undefined;
  onlineManager.setOnline(true);
}

/** A request got no response: treat the app as offline until one does. */
export function reportNetworkFailure(): void {
  if (!onlineManager.isOnline() && probeTimer) return;
  onlineManager.setOnline(false);
  clearInterval(probeTimer);
  probeTimer = setInterval(() => void probe(), PROBE_MS);
}

/** Start from what the browser says, and listen for it changing. */
export function initConnectivity(): void {
  // TanStack Query starts out assuming a connection and only learns otherwise
  // from an `offline` event, which never fires for an app opened already
  // offline.
  onlineManager.setOnline(navigator.onLine);
  if (!navigator.onLine) reportNetworkFailure();
  globalThis.addEventListener("online", () => void probe());
  globalThis.addEventListener("offline", () => reportNetworkFailure());
}
