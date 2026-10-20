import { createRoot } from "react-dom/client";
import App from "./app";
import "@/styles/index.css";
import { captureInstallPrompt, registerAppShell } from "@/lib/app-shell";

// Before render: Chrome's install prompt fires once, early.
captureInstallPrompt();
// The offline copy of the app. Production only; see lib/app-shell.
void registerAppShell();

createRoot(document.getElementById("root")!).render(<App />);

const splash = document.getElementById("app-loading");
if (splash) {
  splash.classList.add("is-hiding");
  splash.addEventListener("transitionend", () => splash.remove(), {
    once: true,
  });
}
