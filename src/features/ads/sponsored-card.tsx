import { useCallback, useState } from "react";
import { Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarkAdSeen } from "@/hooks/use-ad-inbox";
import type { InAppAd } from "@/lib/api/ad-inbox-controller";
import { openAdDestination } from "./ad-destination";
import { useAdImpression } from "./use-ad-impression";

/** More than a few tags turns the card into a wall of chips. */
const MAX_TAGS = 3;

/**
 * An advertisement as a feed card, sitting between offers or profiles.
 *
 * Built to the same measurements as JobCard so it reads as part of the feed
 * rather than as something pasted over it — and, unlike the popup it replaced,
 * it has no way to be closed: the reader scrolls past it.
 */
export function SponsoredCard({ ad }: Readonly<{ ad: InAppAd }>) {
  const impressionRef = useAdImpression(ad.deliveryId);
  const { mutate: markSeen } = useMarkAdSeen();
  // A broken advertiser image would otherwise leave a large empty band.
  const [imageFailed, setImageFailed] = useState(false);

  const image = imageFailed ? null : ad.imageUrl;
  const tags = (ad.tags ?? []).slice(0, MAX_TAGS);
  const ctaUrl = ad.ctaUrl;

  const open = useCallback(() => {
    if (!ctaUrl) return;
    openAdDestination(ctaUrl, () => markSeen(ad.deliveryId));
  }, [ctaUrl, markSeen, ad.deliveryId]);

  const body = (
    <>
      {image && (
        <img
          src={image}
          alt=""
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="mt-3 aspect-video w-full rounded-lg object-cover"
        />
      )}

      <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
        {ad.description}
      </p>

      {tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
            >
              #{tag}
            </li>
          ))}
        </ul>
      )}
    </>
  );

  return (
    <article ref={impressionRef} className="rounded-xl bg-card p-4 shadow-soft">
      {/* Where JobCard puts the employer's avatar and name. Keeping the label
          in that slot means «Sponsorisé» is visible whether or not the advert
          has an image, in the place the eye already goes. */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-whatsapp/10">
          <Megaphone className="h-5 w-5 text-whatsapp" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-snug text-foreground">
            {ad.title}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">Sponsorisé</p>
        </div>
      </div>

      {/* The CTA below is a sibling, not a child (same rule as JobCard's
          bookmark): a button inside a button is invalid and untappable. */}
      {ctaUrl ? (
        <button
          type="button"
          onClick={open}
          className="block w-full text-left"
          aria-label={ad.title}
        >
          {body}
        </button>
      ) : (
        <div>{body}</div>
      )}

      {ctaUrl && (
        <Button variant="outline" className="mt-4 w-full" onClick={open}>
          {ad.callToAction || "En savoir plus"}
        </Button>
      )}
    </article>
  );
}
