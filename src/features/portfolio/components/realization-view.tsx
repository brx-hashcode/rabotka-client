import { useEffect, useState, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { PortfolioItem } from "../types";

type Author = {
  fullName: string;
  avatarUrl: string | null;
  /** Where tapping the author goes. Omitted on the owner's own view. */
  href?: string;
};

type Props = {
  item: PortfolioItem;
  author?: Author;
  /** Owner controls rendered under the caption. */
  actions?: ReactNode;
  onAuthorClick?: () => void;
};

/**
 * A single realization, shown as a full screen rather than a dialog.
 *
 * Replaces the old modal viewer: on a phone a square photo plus its caption
 * fills the viewport anyway, so a dialog only added a cramped inset and a
 * scrim. As a route it also gets a real back button, a shareable URL, and the
 * system back gesture — the behaviour people expect from a post detail.
 */
export function RealizationView({
  item,
  author,
  actions,
  onAuthorClick,
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

  const total = item.images.length;
  const multiple = total > 1;

  return (
    <article className="mx-auto w-full max-w-xl pb-10">
      {author && (
        <AuthorRow author={author} onClick={onAuthorClick} />
      )}

      {/* Dark bed so light images can't swallow the overlay controls. */}
      <div className="relative bg-neutral-900">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {item.images.map((img, index) => (
              <div key={img.id} className="min-w-0 flex-[0_0_100%]">
                <SlideImage url={img.imageUrl} index={index} />
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

      <div className={cn("space-y-3 px-4", multiple ? "pt-1" : "pt-4")}>
        <div className="space-y-1">
          <h1 className="text-foreground text-base font-bold">{item.title}</h1>
          {item.description && (
            <p className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed">
              {item.description}
            </p>
          )}
        </div>
        {actions}
      </div>
    </article>
  );
}

function AuthorRow({
  author,
  onClick,
}: Readonly<{ author: Author; onClick?: () => void }>) {
  const initials =
    author.fullName
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const content = (
    <>
      <Avatar className="size-9">
        {author.avatarUrl && (
          <AvatarImage
            src={author.avatarUrl}
            alt={author.fullName}
            className="object-cover"
          />
        )}
        <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="truncate text-sm font-semibold text-foreground">
        {author.fullName}
      </span>
    </>
  );

  if (!onClick) {
    return <div className="flex items-center gap-3 px-4 pb-3">{content}</div>;
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 pb-3 text-left active:opacity-70"
    >
      {content}
    </button>
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
      {/* contain, not cover: this view exists to inspect the work uncropped. */}
      <img
        src={url}
        alt={`Réalisation ${index + 1}`}
        className="h-full w-full object-contain"
        onError={() => setBroken(true)}
      />
    </div>
  );
}
