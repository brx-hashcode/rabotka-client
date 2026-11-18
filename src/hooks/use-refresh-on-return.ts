import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  RETURN_REFRESH_KEYS,
  shouldRefreshOnReturn,
} from "@/lib/notification-refresh";

/**
 * Re-reads the time-sensitive screens when the app comes back to the
 * foreground after 30 seconds or more away (`RETURN_REFRESH_KEYS`).
 *
 * The app keeps data for 5 minutes and does not refetch on focus — a WebView
 * fires focus constantly — so someone back from WhatsApp saw the screen as
 * they left it. Invalidation refetches what is on screen and marks the rest
 * stale for its next visit; nothing else is touched.
 */
export function useRefreshOnReturn(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;
    let hiddenAt: number | null =
      document.visibilityState === "hidden" ? Date.now() : null;

    const onChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        return;
      }
      if (shouldRefreshOnReturn(hiddenAt, Date.now())) {
        for (const queryKey of RETURN_REFRESH_KEYS) {
          void queryClient.invalidateQueries({ queryKey });
        }
      }
      hiddenAt = null;
    };

    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, [enabled, queryClient]);
}
