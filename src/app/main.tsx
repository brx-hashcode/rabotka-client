import { createRoot } from "react-dom/client";
import App from "./app";
import "@/styles/index.css";
import { captureInstallPrompt, registerAppShell } from "@/lib/app-shell";
import { persistQueryCache, restoreQueryCache } from "@/lib/offline-cache";
import { initConnectivity } from "@/lib/connectivity";
import { queryClient } from "./providers";

// Offline means paused requests and the stored data, not errors — see
// lib/connectivity.
initConnectivity();

// Before render: Chrome's install prompt fires once, early.
captureInstallPrompt();
// The offline copy of the app. Production only; see lib/app-shell.
void registerAppShell();

/**
 * The stored data first, so screens open on it rather than a loader — online
 * or not. Capped: a slow IndexedDB must never be what keeps the app from
 * starting.
 */
const RESTORE_CEILING_MS = 400;

void Promise.race([
  restoreQueryCache(queryClient),
  new Promise((resolve) => setTimeout(resolve, RESTORE_CEILING_MS)),
]).finally(() => {
  persistQueryCache(queryClient);
  createRoot(document.getElementById("root")!).render(<App />);
  hideSplash();
});

function hideSplash() {
  const splash = document.getElementById("app-loading");
  if (splash) {
    splash.classList.add("is-hiding");
    splash.addEventListener("transitionend", () => splash.remove(), {
      once: true,
    });
  }
}
