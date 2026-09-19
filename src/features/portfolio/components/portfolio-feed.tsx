import { useState } from "react";
import { ImageOff, Images } from "lucide-react";

import { postExcerpt, postLabel } from "../post-text";
import type { PortfolioItem } from "../types";

type Props = {
  items: PortfolioItem[];
  onOpen: (item: PortfolioItem) => void;
};

/**
 * Publications as a column of posts.
 *
 * Replaces a 3-column grid of square photo tiles. The grid could only speak in
 * pictures — it keyed off `images[0]` and labelled each tile with the title —
 * so a text-only publication had no tile to be, and with titles gone the
 * remaining ones had nothing to announce themselves with. A feed says what a
 * post is regardless of which half of it exists.
 */
export function PortfolioFeed({ items, onOpen }: Readonly<Props>) {
  return (
    <div className="mx-auto w-full max-w-xl space-y-3">
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
  const { text, truncated } = postExcerpt(item.description);
  const cover = item.images[0];
  const extra = item.images.length - 1;

  return (
    // One button for the whole card, so the carousel stays on the detail
    // screen: its arrows and dots are buttons themselves, and nesting those
    // inside this one would be invalid markup and swallow the taps.
    <button
      type="button"
      onClick={() => onOpen(item)}
      aria-label={postLabel(item.description, item.images.length)}
      className="bg-card block w-full overflow-hidden rounded-xl text-left shadow-soft transition-opacity active:opacity-80"
    >
      {text && (
        <p className="text-foreground whitespace-pre-line px-4 pb-3 pt-4 text-sm leading-relaxed">
          {text}
          {truncated && (
            <span className="text-muted-foreground"> … voir plus</span>
          )}
        </p>
      )}

      {cover && (
        <div className="relative">
          {/* `cover` here, `contain` on the detail: a column of cards needs one
              rhythm, and a tall portrait shown whole would eat the screen.
              Tapping through shows it uncropped. */}
          <CoverImage url={cover.imageUrl} />
          {extra > 0 && (
            <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <Images className="size-3.5" />+{extra}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

function CoverImage({ url }: Readonly<{ url: string }>) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div className="bg-muted text-muted-foreground flex aspect-square w-full items-center justify-center">
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
