/**
 * Turning a publication's body into the short forms other screens need.
 *
 * A publication has no title any more, so every place that used to print one —
 * a feed card, a page title, a screen-reader label — has to make do with the
 * body, which may be absent entirely. Kept pure and in one file so those
 * places cannot drift apart, and so the rules are testable without a DOM.
 */

/** Lines of body a feed card shows before it cuts. */
const EXCERPT_LINES = 6;
/** Characters a feed card shows before it cuts. */
const EXCERPT_CHARS = 280;
/** Characters a page title gets — enough to recognise, short enough to fit. */
const TITLE_CHARS = 60;

/**
 * The body as a feed card shows it, and whether anything was left behind.
 *
 * Cuts on a word boundary: a caption sliced mid-word reads as corrupted text
 * rather than as an excerpt. `truncated` drives the "voir plus" affordance —
 * without it a long post looks complete at exactly the point it was cut.
 */
export function postExcerpt(description: string | null): {
  text: string;
  truncated: boolean;
} {
  const body = description?.trim() ?? "";
  if (!body) return { text: "", truncated: false };

  const lines = body.split("\n");
  let text = lines.slice(0, EXCERPT_LINES).join("\n");
  let truncated = lines.length > EXCERPT_LINES;

  if (text.length > EXCERPT_CHARS) {
    const cut = text.slice(0, EXCERPT_CHARS);
    const lastSpace = cut.lastIndexOf(" ");
    text = lastSpace > EXCERPT_CHARS / 2 ? cut.slice(0, lastSpace) : cut;
    truncated = true;
  }

  return { text: text.trimEnd(), truncated };
}

/**
 * One line naming a publication, for a page title or an accessible label.
 *
 * Falls back to the photos when there is no text, because an images-only post
 * is a normal publication rather than a defective one — labelling it
 * "Publication" alone would make every such post indistinguishable in a list
 * read aloud.
 */
export function postLabel(
  description: string | null,
  imageCount: number,
): string {
  const body = description?.trim() ?? "";
  if (body) {
    const firstLine = body.split("\n")[0].trim();
    return firstLine.length > TITLE_CHARS
      ? `${firstLine.slice(0, TITLE_CHARS).trimEnd()}…`
      : firstLine;
  }
  if (imageCount > 1) return `Publication — ${imageCount} images`;
  if (imageCount === 1) return "Publication — 1 image";
  return "Publication";
}
