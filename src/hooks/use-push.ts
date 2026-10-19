import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { disablePush, enablePush, getPushState, type PushState } from "@/lib/push";

/** This device's Web Push state, and the switch for it. `null` while reading. */
export function usePush() {
  const [state, setState] = useState<PushState | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let alive = true;
    void getPushState().then((s) => alive && setState(s));
    return () => {
      alive = false;
    };
  }, []);

  const enable = useCallback(async () => {
    setPending(true);
    try {
      const next = await enablePush();
      setState(next);
      if (next === "on") toast.success("Notifications activées sur cet appareil.");
      if (next === "denied") toast.error("Notifications bloquées dans les réglages du téléphone.");
    } catch {
      toast.error("Impossible d'activer les notifications. Réessayez.");
    } finally {
      setPending(false);
    }
  }, []);

  const disable = useCallback(async () => {
    setPending(true);
    try {
      await disablePush();
      setState("off");
    } finally {
      setPending(false);
    }
  }, []);

  return { state, pending, enable, disable };
}
