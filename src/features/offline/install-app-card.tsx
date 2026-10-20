import { useEffect, useState, useSyncExternalStore } from "react";
import { Download, X } from "lucide-react";
import { canInstall, promptInstall, subscribeInstall } from "@/lib/app-shell";

const VISITS_KEY = "rabotka:visits";
const DISMISSED_KEY = "rabotka:install-dismissed";
/** Not on a first visit: only once the person is coming back. */
const MIN_VISITS = 3;

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode: the card simply shows again */
  }
}

/**
 * « Installer Rabotka » — on Android Chrome, once someone comes back. An
 * installed app opens without a network and keeps its stored data far more
 * reliably than a tab, let alone WhatsApp's in-app browser.
 */
export function InstallAppCard() {
  const installable = useSyncExternalStore(subscribeInstall, canInstall, () => false);
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    const visits = Number(read(VISITS_KEY) ?? "0") + 1;
    write(VISITS_KEY, String(visits));
    setEligible(visits >= MIN_VISITS && read(DISMISSED_KEY) !== "1");
  }, []);

  if (!installable || !eligible) return null;

  return (
    <div className="mx-4 flex items-center gap-3 rounded-xl bg-card p-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-lime text-lime-foreground">
        <Download className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">Installer Rabotka</p>
        <p className="text-xs text-muted-foreground">
          S'ouvre même sans connexion.
        </p>
      </div>
      <button
        type="button"
        onClick={() => void promptInstall()}
        className="shrink-0 rounded-full bg-whatsapp px-3 py-1.5 text-xs font-semibold text-white"
      >
        Installer
      </button>
      <button
        type="button"
        aria-label="Plus tard"
        onClick={() => {
          write(DISMISSED_KEY, "1");
          setEligible(false);
        }}
        className="shrink-0 p-1 text-muted-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
