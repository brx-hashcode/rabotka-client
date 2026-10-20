import { useSyncExternalStore } from "react";
import { RefreshCw } from "lucide-react";
import { applyUpdate, subscribeUpdate, updateWaiting } from "@/lib/app-shell";

/**
 * « Nouvelle version disponible » — shown when a newer app has been stored
 * and is waiting. The switch happens on the user's tap, never under them.
 */
export function UpdateBanner() {
  const waiting = useSyncExternalStore(subscribeUpdate, updateWaiting, () => false);
  if (!waiting) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-[60] flex justify-center px-4">
      <button
        type="button"
        onClick={applyUpdate}
        className="pointer-events-auto flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-soft"
      >
        <RefreshCw className="size-4" />
        Nouvelle version disponible · Recharger
      </button>
    </div>
  );
}
