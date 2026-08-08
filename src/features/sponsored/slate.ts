import type { InAppAd } from "@/lib/api/ad-inbox-controller";

/**
 * The ads the feed is currently showing, merged with what the inbox now says.
 *
 * The inbox is not a safe render source on its own. Marking a delivery seen
 * removes it from the query cache immediately (optimistically), so a card read
 * straight off the query would vanish under the reader's thumb a second after
 * it scrolled into view, collapsing the feed and pulling the next card up.
 *
 * So the slate only ever grows: an ad that has been shown stays in place even
 * after it leaves the inbox, and ads that arrive later (poll or socket) are
 * appended below rather than inserted above something already on screen.
 *
 * Returns `current` itself when nothing changed — the inbox refetches every few
 * minutes, and a fresh array each time would re-render the whole feed and tear
 * down the impression observers mid-count.
 */
export function mergeAdSlate(
  current: readonly InAppAd[],
  incoming: readonly InAppAd[],
): InAppAd[] {
  const known = new Set(current.map((ad) => ad.deliveryId));
  const added = incoming.filter((ad) => !known.has(ad.deliveryId));

  if (added.length === 0) return current as InAppAd[];
  return [...current, ...added];
}

/**
 * Whether an ad has enough to fill a card.
 *
 * A missing `ctaUrl` is deliberately not disqualifying: the card renders
 * without its button and still takes its impression. Skipping it instead would
 * leave the delivery pending forever, and the inbox holds only five at a time —
 * one unrenderable ad would block every campaign queued behind it.
 */
export function isRenderableAd(ad: InAppAd): boolean {
  return Boolean(ad.title?.trim() || ad.imageUrl);
}
