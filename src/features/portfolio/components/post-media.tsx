import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PortfolioImage } from "../types";

type Props = {
  images: PortfolioImage[];
  /**
   * `contain` inspects the work uncropped, `cover` fills a uniform card.
   *
   * The detail view exists to look closely at one publication, so nothing may
   * be cropped away there. A feed is a column of cards, and a tall portrait
   * photo shown whole turns one post into a whole screen of scrolling.
   */
  fit?: "contain" | "cover";
};

/**
 * The photos of a publication, or nothing at all.
 *
 * Extracted from `RealizationView` so that "a publication may have no images"
 * is answered in exactly one place. It is a real case now, not an error state:
 * a post can be text alone, and rendering an empty dark bed for it — which is
 * what the inlined carousel did — looked like a picture that failed to load.
 */
export function PostMedia({ images, fit = "contain" }: Readonly<Props>) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const total = images.length;
  if (total === 0) return null;
  const multiple = total > 1;

  return (
    <div>
      {/* Dark bed so light images can't swallow the overlay controls. */}
      <div className="relative bg-neutral-900">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {images.map((img, index) => (
              <div key={img.id} className="min-w-0 flex-[0_0_100%]">
                <SlideImage url={img.imageUrl} index={index} fit={fit} />
              </div>
            ))}
          </div>
        </div>

        {multiple && (
          <>
            <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {selected + 1} / {total}
            </span>

            <ArrowButton
              side="left"
              disabled={selected === 0}
              onClick={() => emblaApi?.scrollPrev()}
            />
            <ArrowButton
              side="right"
              disabled={selected === total - 1}
              onClick={() => emblaApi?.scrollNext()}
            />
          </>
        )}
      </div>

      {multiple && (
        <div className="flex justify-center gap-1.5 py-3">
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              aria-label={`Image ${index + 1}`}
              aria-current={index === selected}
              onClick={() => emblaApi?.scrollTo(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === selected
                  ? "w-5 bg-whatsapp"
                  : "w-2 bg-muted-foreground/30",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ArrowButton({
  side,
  disabled,
  onClick,
}: Readonly<{
  side: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}>) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Image précédente" : "Image suivante"}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "absolute top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-opacity hover:bg-black/70 disabled:pointer-events-none disabled:opacity-0",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}

function SlideImage({
  url,
  index,
  fit,
}: Readonly<{ url: string; index: number; fit: "contain" | "cover" }>) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div className="flex aspect-square w-full items-center justify-center text-xs text-white/60">
        Image indisponible
      </div>
    );
  }
  return (
    <div className="aspect-square w-full">
      <img
        src={url}
        alt={`Publication ${index + 1}`}
        className={cn(
          "h-full w-full",
          fit === "cover" ? "object-cover" : "object-contain",
        )}
        onError={() => setBroken(true)}
      />
    </div>
  );
}
