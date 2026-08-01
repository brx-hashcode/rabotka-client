import { createRoot } from "react-dom/client";
import App from "./app";
import "@/styles/index.css";

createRoot(document.getElementById("root")!).render(<App />);

const splash = document.getElementById("app-loading");
if (splash) {
  splash.classList.add("is-hiding");
  splash.addEventListener("transitionend", () => splash.remove(), {
    once: true,
  });
}
