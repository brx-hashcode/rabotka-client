import { useMemo, useRef } from "react";
import { useLocation } from "react-router";
import { useAdInbox } from "@/hooks/use-ad-inbox";
import type { InAppAd } from "@/lib/api/ad-inbox-controller";
import { isRenderableAd, mergeAdSlate } from "./ad-slate";
import { isMutedRoute } from "./muted-routes";

const NO_ADS: InAppAd[] = [];

/**
 * The ads to interleave into a feed, in a stable order.
 *
 * Held in a ref rather than read straight off the query, because the inbox
 * shrinks as ads are marked seen and a card must never vanish mid-scroll — see
 * `mergeAdSlate`. The slate lives as long as the feed is mounted; leaving
 * /home and coming back deliberately starts a fresh one, since by then the
 * inbox has dropped whatever was already counted.
 *
 * The returned array keeps its identity while the slate does. The feed re-runs
 * on every quota and KYC cache read, and a new array each time would re-key
 * the list and tear the impression observers down mid-count.
 */
export function useFeedAds(): InAppAd[] {
  const { pathname } = useLocation();
  const { data } = useAdInbox();
  const slate = useRef<InAppAd[]>(NO_ADS);

  // Safe during render: merging is idempotent, so a double invocation in
  // StrictMode lands on the same slate.
  slate.current = mergeAdSlate(slate.current, data ?? NO_ADS);
  const current = slate.current;

  const renderable = useMemo(() => current.filter(isRenderableAd), [current]);

  // Belt and braces: no feed renders on a muted route today, but the gate
  // travels with the ads rather than with whichever screen shows them.
  if (isMutedRoute(pathname)) return NO_ADS;

  return renderable;
}
