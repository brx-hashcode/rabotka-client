import { useQueryClient } from "@tanstack/react-query";
import { WifiOff } from "lucide-react";
import { useIsOnline } from "@/hooks/use-is-online";
import { offlineDataSavedAt } from "@/lib/offline-cache";
import { offlineLabel } from "./offline-since";

/**
 * « Hors ligne · données d'aujourd'hui à 14 h 30 » — so nobody mistakes the
 * stored copy for the live one. The time is when the data was last fetched
 * (the profile's last answer), or when the stored copy was saved.
 */
export function OfflineBanner() {
  const online = useIsOnline();
  const queryClient = useQueryClient();
  if (online) return null;

  const fetchedAt =
    queryClient.getQueryState(["profile", "me"])?.dataUpdatedAt || offlineDataSavedAt();

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 top-[max(0.5rem,env(safe-area-inset-top))] z-[60] flex justify-center px-4"
    >
      <span className="flex items-center gap-2 rounded-full bg-foreground/90 px-3.5 py-1.5 text-xs font-medium text-background shadow-soft">
        <WifiOff className="size-3.5 shrink-0" />
        {offlineLabel(fetchedAt || null)}
      </span>
    </div>
  );
}
