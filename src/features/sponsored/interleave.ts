/** Jobs before the first ad — the user gets real content before any advert. */
export const FIRST_AD_AFTER = 3;

/** Jobs between one ad and the next, so density stays at roughly 1 in 7. */
export const AD_EVERY = 6;

export type FeedEntry<TItem, TAd> =
  | { kind: "item"; key: string; item: TItem }
  | { kind: "ad"; key: string; item: TAd };

type Options = {
  firstAfter?: number;
  every?: number;
};

/**
 * A feed list with sponsored cards dropped between its items.
 *
 * Typed structurally rather than against `JobFeedItem`, because the worker feed
 * (offers) and the employer feed (recommended profiles) are the same list with
 * different cards in it — one implementation serves both, and the node test
 * environment can import this without pulling in the API layer.
 *
 * Two properties the callers depend on:
 *
 * - Slots are "after the Nth item", so the result for a shorter list is always
 *   a prefix of the result for a longer one. Tapping «Voir plus» therefore
 *   appends and never reshuffles: no rendered card changes key or position, so
 *   nothing remounts and no impression fires twice.
 * - Each ad is used at most once. With more slots than ads the tail simply has
 *   no adverts in it, rather than cycling the same one back around.
 */
export function interleaveAds<
  TItem extends { id: string },
  TAd extends { deliveryId: string },
>(
  items: readonly TItem[],
  ads: readonly TAd[],
  options: Options = {},
): FeedEntry<TItem, TAd>[] {
  const firstAfter = options.firstAfter ?? FIRST_AD_AFTER;
  const every = options.every ?? AD_EVERY;

  const entries: FeedEntry<TItem, TAd>[] = [];
  let nextAd = 0;

  items.forEach((item, index) => {
    // Prefixed keys: an ad and an item that happen to share a raw id would
    // otherwise collide and make React reuse the wrong node.
    entries.push({ kind: "item", key: `item:${item.id}`, item });

    const placed = index + 1;
    const isSlot =
      placed >= firstAfter && (placed - firstAfter) % every === 0;
    // An ad in the last position sits directly above «Voir plus», which makes
    // the feed look like it ended on an advert — and it is the one most likely
    // to idle in the viewport collecting an impression nobody chose to give.
    const isLast = placed === items.length;

    if (isSlot && !isLast && nextAd < ads.length) {
      const ad = ads[nextAd];
      entries.push({ kind: "ad", key: `ad:${ad.deliveryId}`, item: ad });
      nextAd += 1;
    }
  });

  return entries;
}
