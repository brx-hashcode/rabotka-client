import { toast } from "sonner";
import { isInAppBrowser } from "@/lib/in-app-browser";

/**
 * onClick handler that warns in-app-browser users before a download that may
 * not survive their WebView.
 *
 * Use this directly only when you need a differently-shaped link (e.g. a
 * <Button asChild> wrapping an anchor); prefer <DownloadLink> otherwise.
 *
 * Downloads must be plain anchors to real URLs, never `URL.createObjectURL`:
 * most Rabotka users arrive from a WhatsApp bot link and land in an in-app
 * WebView, which cannot download `blob:` URLs at all. Even a real URL can be
 * dropped there, silently — no error reaches the page — so we warn up front
 * rather than let a dead tap look like a broken app.
 */
export function useDownloadHint() {
  return function handleDownloadClick() {
    if (isInAppBrowser()) {
      toast.info(
        "Si le téléchargement ne démarre pas, ouvrez cette page dans votre navigateur via le menu (⋮) en haut à droite.",
        { duration: 8000 },
      );
    }
  };
}
