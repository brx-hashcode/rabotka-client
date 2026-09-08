import { useState } from "react";
import { FileText, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { fileNameFromUrl, looksLikeImageUrl } from "@/lib/image-upload";

/**
 * One attachment, as a square tile.
 *
 * Exists because three places rendered `<img src={url}>` with no fallback:
 * the info drawer, the list card and — now — the comment thread. Claims
 * accepted PDF and DOC until this change, so the rows already in the database
 * contain files that are not images, and every one of them painted as a broken
 * image with nothing to explain it.
 *
 * Two failure modes, two different answers:
 *   - not an image by its extension  → a file tile the user can open
 *   - an image whose bytes fail      → "indisponible", not a broken glyph
 *
 * Split in two because the claims list card is itself a `<button>`: nesting an
 * anchor or a button inside one is invalid, so that caller takes the visual
 * half on its own.
 */
export function AttachmentPreview({
  url,
  index,
  onImageFailed,
}: Readonly<{
  url: string;
  index: number;
  /** Lets an interactive wrapper degrade to a plain download link. */
  onImageFailed?: () => void;
}>) {
  const [failed, setFailed] = useState(false);
  const isImage = looksLikeImageUrl(url);
  const label = fileNameFromUrl(url, `Pièce jointe ${index + 1}`);

  if (isImage && !failed) {
    return (
      <img
        src={url}
        alt={label}
        loading="lazy"
        onError={() => {
          setFailed(true);
          onImageFailed?.();
        }}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-1.5 text-center">
      {isImage ? (
        <ImageOff className="size-5 text-muted-foreground" />
      ) : (
        <FileText className="size-5 text-muted-foreground" />
      )}
      <span className="w-full truncate text-[10px] leading-tight text-muted-foreground">
        {isImage ? "Indisponible" : label}
      </span>
    </div>
  );
}

export function AttachmentThumb({
  url,
  index,
  onOpen,
  className,
}: Readonly<{
  url: string;
  index: number;
  /** Omit to open the file in a new tab instead of the in-app viewer. */
  onOpen?: (url: string) => void;
  className?: string;
}>) {
  const [failed, setFailed] = useState(false);
  const isImage = looksLikeImageUrl(url);
  const label = fileNameFromUrl(url, `Pièce jointe ${index + 1}`);

  const shell = cn(
    "relative block aspect-square overflow-hidden rounded-md bg-muted",
    className,
  );
  const body = (
    <AttachmentPreview
      url={url}
      index={index}
      onImageFailed={() => setFailed(true)}
    />
  );

  // A non-image, or an image we could not paint, has nothing for the in-app
  // viewer to show — send those to the browser, which can at least download.
  if (!onOpen || !isImage || failed) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={shell}
        title={label}
      >
        {body}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(url)}
      className={shell}
      title={label}
      aria-label={`Ouvrir ${label}`}
    >
      {body}
    </button>
  );
}
