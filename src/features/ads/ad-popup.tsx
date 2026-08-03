import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdInbox, useDismissAd } from "@/hooks/use-ad-inbox";
import type { InAppAd } from "@/lib/api/ad-inbox-controller";

/**
 * Routes that own the whole screen or are mid-flow — an ad on top of a payment
 * or an onboarding step is both intrusive and a conversion killer.
 */
const MUTED_ROUTE_PREFIXES = [
  "/login",
  "/onboarding",
  "/verify-whatsapp",
  "/pay",
  "/r/",
  "/s/",
];

export function isMutedRoute(pathname: string): boolean {
  // "/" is the marketing landing, not the app — and muting it keeps anonymous
  // visitors from triggering a profile lookup they have no session for.
  if (pathname === "/") return true;
  return MUTED_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Full-screen advertisement card shown over the app. Closing it marks the
 * delivery seen, so it does not come back until the campaign dispatches again.
 */
export function AdPopup() {
  const { pathname } = useLocation();

  // Gate before the inner component mounts, so muted routes issue no profile
  // lookup, no inbox poll and no socket connection at all.
  if (isMutedRoute(pathname)) return null;

  return <PendingAd />;
}

function PendingAd() {
  const { data: ads = [] } = useAdInbox();
  const { mutate: dismiss } = useDismissAd();

  const ad = ads[0];
  const deliveryId = ad?.deliveryId;
  const ctaUrl = ad?.ctaUrl;

  const close = useCallback(() => {
    if (deliveryId) dismiss(deliveryId);
  }, [dismiss, deliveryId]);

  const openCta = useCallback(() => {
    if (!ctaUrl) return;
    // Same tab, not window.open: most traffic lands in the WhatsApp/Facebook
    // WebView, which silently swallows popups (see lib/in-app-browser). The
    // /r/:hash hop records the click and marks the delivery seen server-side,
    // so there is no dismissal to fire here — for an untracked fallback URL we
    // still mark it, since nothing else will.
    if (!ctaUrl.includes("/r/")) close();
    globalThis.location.assign(ctaUrl);
  }, [ctaUrl, close]);

  if (!ad) return null;

  return <AdCard ad={ad} onClose={close} onCta={openCta} />;
}

function AdCard({
  ad,
  onClose,
  onCta,
}: Readonly<{ ad: InAppAd; onClose: () => void; onCta: () => void }>) {
  // A broken advertiser image would otherwise leave a large empty band.
  const [imageFailed, setImageFailed] = useState(false);
  const image = imageFailed ? null : ad.imageUrl;
  const tags = ad.tags ?? [];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    globalThis.addEventListener("keydown", onKeyDown);
    return () => globalThis.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-3"
      role="dialog"
      aria-modal="true"
      aria-label="Publicité"
    >
      {/* Sibling rather than a wrapper, so dismissing on backdrop tap needs no
          click-bubbling tricks and stays a real, focusable button. */}
      <button
        type="button"
        aria-label="Fermer la publicité"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
      />

      <aside
        className="relative flex h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-card shadow-soft"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la publicité"
          className="absolute right-3 top-3 z-10 rounded-full bg-background/90 p-2 text-foreground shadow-soft transition-opacity hover:opacity-80"
        >
          <X className="size-5" />
        </button>

        {/* The visual takes every pixel the text doesn't need, so a short ad
            has no dead whitespace and a long one still gets a real image. */}
        {image && (
          <div className="relative min-h-0 flex-1">
            <img
              src={image}
              alt=""
              className="size-full object-cover"
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
            <span className="absolute left-4 top-4 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              Publicité
            </span>
          </div>
        )}

        <div
          className={cn(
            "flex min-h-0 flex-col gap-2 p-6 pb-4",
            // Sized by its content, capped so the image never disappears.
            image ? "max-h-[58%] shrink-0" : "flex-1",
          )}
        >
          {!image && (
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Publicité
            </span>
          )}

          <p className="shrink-0 text-2xl font-bold leading-tight text-card-foreground">
            {ad.title}
          </p>

          {/* Only the body scrolls — the title and tags stay put, so a long ad
              never pushes its own headline out of sight. */}
          <p className="min-h-0 flex-1 overflow-y-auto text-base leading-relaxed text-muted-foreground">
            {ad.description}
          </p>

          {tags.length > 0 && (
            <ul className="flex shrink-0 flex-wrap gap-1.5 pt-1">
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
        </div>

        {ad.ctaUrl && (
          <div className="shrink-0 px-6 pb-6">
            <Button
              variant="outline"
              className="h-13 w-full text-base font-semibold"
              onClick={onCta}
            >
              {ad.callToAction || "En savoir plus"}
            </Button>
          </div>
        )}
      </aside>
    </div>
  );
}
