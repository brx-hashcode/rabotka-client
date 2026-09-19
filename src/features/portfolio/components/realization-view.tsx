import { type ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { PostMedia } from "./post-media";
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
  const hasImages = item.images.length > 0;

  return (
    <article className="mx-auto w-full max-w-xl pb-10">
      {author && (
        <AuthorRow author={author} onClick={onAuthorClick} />
      )}

      <PostMedia images={item.images} />

      <div className={cn("space-y-3 px-4", hasImages ? "pt-4" : "pt-2")}>
        {/* No heading: a publication has no title any more, so the text is the
            post itself rather than a caption under one. An images-only post
            simply has nothing here. */}
        {item.description && (
          <p className="text-foreground whitespace-pre-line text-sm leading-relaxed">
            {item.description}
          </p>
        )}
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
