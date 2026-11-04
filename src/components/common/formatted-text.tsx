import { toTextBlocks } from "@/lib/text-blocks";
import { cn } from "@/lib/utils";

/**
 * A description as the employer typed it, with its « - » lines shown as a
 * real list: each item indented under its own marker, so a wrapped line no
 * longer slides back under the dash.
 */
export function FormattedText({
  text,
  className,
}: Readonly<{ text: string; className?: string }>) {
  return (
    <div className={cn("space-y-3 text-sm leading-relaxed", className)}>
      {toTextBlocks(text).map((block, i) => {
        if (block.kind === "paragraph") {
          return (
            <p key={i} className="whitespace-pre-line">
              {block.lines.join("\n")}
            </p>
          );
        }
        const List = block.ordered ? "ol" : "ul";
        return (
          <List
            key={i}
            className={cn(
              "space-y-1 pl-5",
              block.ordered ? "list-decimal" : "list-disc",
              "marker:text-muted-foreground",
            )}
          >
            {block.items.map((item, j) => (
              <li key={j} className="pl-0.5">
                {item}
              </li>
            ))}
          </List>
        );
      })}
    </div>
  );
}
