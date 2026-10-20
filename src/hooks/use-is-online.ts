import { useSyncExternalStore } from "react";
import { onlineManager } from "@tanstack/react-query";

/**
 * Whether the app can reach its server — the same signal TanStack Query
 * pauses on (lib/connectivity), not `navigator.onLine`, which lies on a dead
 * 2G link.
 */
export function useIsOnline(): boolean {
  return useSyncExternalStore(
    (cb) => onlineManager.subscribe(cb),
    () => onlineManager.isOnline(),
    () => true,
  );
}

/** What a disabled action says while offline. */
export const OFFLINE_ACTION_HINT = "Disponible une fois connecté";
