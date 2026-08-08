import { useCallback, useEffect, useRef } from "react";
import { useMarkAdSeen } from "@/hooks/use-ad-inbox";
import { observeImpression } from "./observe-impression";

/**
 * Deliveries already counted this session.
 *
 * Module-level rather than per-component: navigating away from the feed and
 * back remounts the card, and the same ad must not be billed twice.
 */
const counted = new Set<string>();

/**
 * Marks a delivery seen once its card has really been looked at.
 *
 * This is what replaces closing the popup. The server stamps `opened_at` and
 * retires the delivery, so it has to mean "the reader saw this" — the rule
 * itself lives in `observeImpression`.
 *
 * Returns a ref callback rather than taking a ref object: the callback runs
 * when the node actually attaches, which is when there is something to observe.
 */
export function useAdImpression(deliveryId: string) {
  const { mutate: markSeen } = useMarkAdSeen();

  // The mutation identity changes between renders; the observer must not be
  // rebuilt for that, or a card near the threshold never finishes its dwell.
  const markSeenRef = useRef(markSeen);
  useEffect(() => {
    markSeenRef.current = markSeen;
  }, [markSeen]);

  const teardown = useRef<(() => void) | null>(null);

  return useCallback(
    (node: HTMLElement | null) => {
      teardown.current?.();
      teardown.current = null;

      if (!node || counted.has(deliveryId)) return;

      teardown.current = observeImpression(node, {
        hasCounted: () => counted.has(deliveryId),
        onImpression: () => {
          counted.add(deliveryId);
          markSeenRef.current(deliveryId);
        },
      });
    },
    [deliveryId],
  );
}
