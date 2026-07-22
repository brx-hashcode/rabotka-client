import { useState } from "react";
import { ImageOff, Images } from "lucide-react";

import type { PortfolioItem } from "../types";

type Props = {
  items: PortfolioItem[];
  onOpen: (item: PortfolioItem) => void;
};

export function PortfolioGrid({ items, onOpen }: Readonly<Props>) {
  return (
    <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
      {items.map((item) => (
        <GridTile key={item.id} item={item} onOpen={onOpen} />
      ))}
    </div>
  );
}

function GridTile({
  item,
  onOpen,
}: Readonly<{ item: PortfolioItem; onOpen: (item: PortfolioItem) => void }>) {
  const [broken, setBroken] = useState(false);
  const cover = item.images[0]?.imageUrl;
  const isMulti = item.images.length > 1;

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="group bg-muted relative aspect-square overflow-hidden"
      aria-label={item.title}
    >
      {cover && !broken ? (
        <img
          src={cover}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="text-muted-foreground flex h-full w-full items-center justify-center">
          <ImageOff className="size-5" />
        </div>
      )}
      {isMulti && (
        <Images className="absolute right-1.5 top-1.5 size-4 text-white drop-shadow" />
      )}
    </button>
  );
}
