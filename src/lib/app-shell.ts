/**
 * The service worker's app-shell side, from the page: register it, and offer
 * the newer version when one is waiting.
 *
 * Registered for everyone in production. It used to be registered only when
 * someone turned push notifications on, so nobody else had an offline copy.
 * Not in dev: the dev server has no offline manifest, and a worker there only
 * gets in the way of hot reload.
 */
const SW_URL = "/sw.js";

type Listener = () => void;
let waiting: ServiceWorker | null = null;
const listeners = new Set<Listener>();

function setWaiting(worker: ServiceWorker | null) {
  waiting = worker;
  listeners.forEach((l) => l());
}

/** Whether a newer version is installed and waiting for the user's go. */
export function updateWaiting(): boolean {
  return waiting !== null;
}

export function subscribeUpdate(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Switch to the waiting version, then reload once it has taken over. */
export function applyUpdate(): void {
  if (!waiting) return;
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloaded) return;
    reloaded = true;
    globalThis.location.reload();
  });
  waiting.postMessage({ type: "SKIP_WAITING" });
}

export async function registerAppShell(): Promise<void> {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register(SW_URL);
    // A version left waiting by an earlier visit. Only an UPDATE when a worker
    // already controls the page — the very first install is not one.
    if (reg.waiting && navigator.serviceWorker.controller) setWaiting(reg.waiting);
    reg.addEventListener("updatefound", () => {
      const next = reg.installing;
      next?.addEventListener("statechange", () => {
        if (next.state === "installed" && navigator.serviceWorker.controller) {
          setWaiting(next);
        }
      });
    });
    // Look for a new version when the app comes back to the foreground: an
    // installed app can stay open for days.
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") void reg.update().catch(() => undefined);
    });
  } catch {
    // No offline copy this time; the app works as before.
  }
}
