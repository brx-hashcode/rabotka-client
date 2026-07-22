import { useEffect, useState, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";

import {
  Dialog,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0 sm:max-w-lg">
        <div className="bg-muted overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {item.images.map((img, index) => (
              <div key={img.id} className="min-w-0 flex-[0_0_100%]">
                <ViewerImage url={img.imageUrl} index={index} />
              </div>
            ))}
          </div>
        </div>

        {item.images.length > 1 && (
          <div className="flex justify-center gap-1.5 py-2.5">
            {item.images.map((img, index) => (
              <button
                key={img.id}
                type="button"
                aria-label={`Image ${index + 1}`}
                onClick={() => emblaApi?.scrollTo(index)}
                className={cn(
                  "size-1.5 rounded-full transition-colors",
                  index === selected ? "bg-primary" : "bg-muted-foreground/30",
                )}
              />
            ))}
          </div>
        )}

        <div className="space-y-2 p-4">
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

function ViewerImage({
  url,
  index,
}: Readonly<{ url: string; index: number }>) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div className="text-muted-foreground flex aspect-square w-full items-center justify-center text-xs">
        Image indisponible
      </div>
    );
  }
  return (
    <div className="aspect-square w-full">
      <img
        src={url}
        alt={`Réalisation ${index + 1}`}
        className="h-full w-full object-cover"
        onError={() => setBroken(true)}
      />
    </div>
  );
}
