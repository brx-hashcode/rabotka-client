import { useState } from "react";
import { ImageOff, Images, Quote } from "lucide-react";

import { postLabel } from "../post-text";
import type { PortfolioItem } from "../types";

type Props = {
  items: PortfolioItem[];
  onOpen: (item: PortfolioItem) => void;
};

/**
 * Publications as a two-column grid of compact cards.
 *
 * It was a single column of full-width posts, where one photo filled most of
 * a phone screen — a portfolio of three jobs took three screens to see. A
 * grid shows the body of work at a glance, which is what an employer scans
 * for, and a tap opens the full post.
 *
 * It is not the old photo-only grid either: a text-only publication (« je
 * suis disponible cette semaine ») gets a card of its own, the same size as a
 * photo card, so the grid keeps its rhythm whatever each post holds.
 */
export function PortfolioFeed({ items, onOpen }: Readonly<Props>) {
  return (
    <div className="mx-auto grid w-full max-w-xl grid-cols-2 gap-3">
      {items.map((item) => (
        <PostCard key={item.id} item={item} onOpen={onOpen} />
      ))}
    </div>
  );
}

function PostCard({
  item,
  onOpen,
}: Readonly<{ item: PortfolioItem; onOpen: (item: PortfolioItem) => void }>) {
  const text = item.description?.trim() ?? "";
  const cover = item.images[0];
  const extra = item.images.length - 1;

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      aria-label={postLabel(item.description, item.images.length)}
      // Flat: the white surface on the grey page is separation enough — a
      // shadow on every card of a grid made it look raised off the screen.
      className="flex flex-col overflow-hidden rounded-xl bg-card text-left transition-transform active:scale-[0.98] motion-reduce:active:scale-100"
    >
      {cover ? (
        <div className="relative">
          <CoverImage url={cover.imageUrl} />
          {extra > 0 && (
            <span className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
              <Images className="size-3" />+{extra}
            </span>
          )}
        </div>
      ) : (
        // A text-only post, as a card the size of a photo.
        <div className="flex aspect-square flex-col bg-lime/70 p-3 text-lime-foreground">
          <Quote className="size-4 shrink-0 opacity-60" />
          <p className="mt-1.5 line-clamp-6 text-sm font-medium leading-snug">
            {text}
          </p>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-1 px-2.5 py-2">
        {cover && text && (
          <p className="line-clamp-2 text-xs leading-snug text-foreground">
            {text}
          </p>
        )}
        <span className="mt-auto text-[11px] text-muted-foreground">
          {postDate(item.createdAt)}
        </span>
      </div>
    </button>
  );
}

function CoverImage({ url }: Readonly<{ url: string }>) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div className="flex aspect-square w-full items-center justify-center bg-muted text-muted-foreground">
        <ImageOff className="size-5" />
      </div>
    );
  }
  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      className="aspect-square w-full object-cover"
      onError={() => setBroken(true)}
    />
  );
}

/** « 12 oct. », or « 12 oct. 2025 » for another year. */
function postDate(iso: string): string {
  const d = new Date(iso);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}
