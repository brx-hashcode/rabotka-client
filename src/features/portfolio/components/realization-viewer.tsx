import { useEffect, useState, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { PortfolioItem } from "../types";

type Props = {
  item: PortfolioItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional owner controls rendered under the caption. */
  actions?: ReactNode;
};

export function RealizationViewer({
  item,
  open,
  onOpenChange,
  actions,
}: Readonly<Props>) {
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

  // Reset to the first image whenever a new realization is opened.
  useEffect(() => {
    if (emblaApi && item) emblaApi.scrollTo(0, true);
  }, [emblaApi, item]);

  if (!item) return null;

  const total = item.images.length;
  const multiple = total > 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className="max-w-md gap-0 overflow-hidden rounded-2xl border-0 p-0 shadow-medium sm:max-w-lg"
      >
        {/* The photo area is dark so light images can't swallow the overlay controls. */}
        <div className="relative bg-neutral-900">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {item.images.map((img, index) => (
                <div key={img.id} className="min-w-0 flex-[0_0_100%]">
                  <ViewerImage url={img.imageUrl} index={index} />
                </div>
              ))}
            </div>
          </div>

          <DialogClose
            aria-label="Fermer"
            className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-white/70"
          >
            <X className="size-5" strokeWidth={2.5} />
          </DialogClose>

          {multiple && (
            <>
              <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
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
            {item.images.map((img, index) => (
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

        <div className="space-y-3 p-4">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-base">{item.title}</DialogTitle>
            {item.description && (
              <DialogDescription className="whitespace-pre-line">
                {item.description}
              </DialogDescription>
            )}
          </DialogHeader>
          {actions}
        </div>
      </DialogContent>
    </Dialog>
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

function ViewerImage({
  url,
  index,
}: Readonly<{ url: string; index: number }>) {
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
      {/* contain, not cover: the viewer exists to inspect the work uncropped. */}
      <img
        src={url}
        alt={`Réalisation ${index + 1}`}
        className="h-full w-full object-contain"
        onError={() => setBroken(true)}
      />
    </div>
  );
}
