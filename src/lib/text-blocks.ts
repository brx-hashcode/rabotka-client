/**
 * A free-text description cut into paragraphs and lists.
 *
 * Employers type lists the way they would in WhatsApp — « - », « • », « * » or
 * « 1. » at the start of a line. Rendered as plain pre-line text, the dash sits
 * flush with the wrapped line below it and reads as a wall of text; as a list,
 * each item keeps its own indent.
 */
export type TextBlock =
  | { kind: "paragraph"; lines: string[] }
  | { kind: "list"; ordered: boolean; items: string[] };

const BULLET = /^\s*[-•*–—▪●]\s+(.*)$/;
const NUMBERED = /^\s*\d{1,2}[.)]\s+(.*)$/;

export function toTextBlocks(text: string): TextBlock[] {
  const blocks: TextBlock[] = [];
  let current: TextBlock | null = null;

  const flush = () => {
    if (current) blocks.push(current);
    current = null;
  };

  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
      continue;
    }
    const bullet = BULLET.exec(line);
    const numbered = bullet ? null : NUMBERED.exec(line);
    const item = bullet?.[1] ?? numbered?.[1];
    if (item !== undefined) {
      const ordered = !!numbered;
      if (current?.kind !== "list" || current.ordered !== ordered) {
        flush();
        current = { kind: "list", ordered, items: [] };
      }
      current.items.push(item.trim());
    } else if (current?.kind === "paragraph") {
      current.lines.push(line.trim());
    } else {
      flush();
      current = { kind: "paragraph", lines: [line.trim()] };
    }
  }
  flush();
  return blocks;
}
