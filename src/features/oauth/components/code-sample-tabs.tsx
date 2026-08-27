import { useState } from "react";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";

export type CodeSample = {
  /** Tab label, e.g. "Node.js". */
  readonly label: string;
  readonly code: string;
};

type CodeSampleTabsProps = {
  readonly samples: readonly CodeSample[];
};

/**
 * One snippet per language, behind tabs.
 *
 * Stacking two full implementations of the same thing would double the length
 * of the page for a reader who only needs one of them — and a developer
 * scrolling past a complete PHP file to reach the Node one has been made to
 * work for it.
 *
 * The choice is local state rather than a URL parameter or `localStorage`: it
 * is one section of one page, and persisting it would mean a reader who once
 * clicked PHP finds every future visit in PHP with no obvious way back.
 */
export function CodeSampleTabs({ samples }: Readonly<CodeSampleTabsProps>) {
  const [active, setActive] = useState(0);
  const current = samples[active] ?? samples[0];

  return (
    <div>
      <div role="tablist" className="mb-2 flex gap-1">
        {samples.map((sample, index) => (
          <button
            key={sample.label}
            type="button"
            role="tab"
            aria-selected={index === active}
            onClick={() => setActive(index)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              index === active
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {sample.label}
          </button>
        ))}
      </div>

      {/* `relative` anchors the copy button; `pr-14` keeps the longest line
          from running underneath it. */}
      <div className="relative">
        <CopyButton value={current.code} />
        <pre className="bg-card shadow-soft overflow-x-auto rounded-lg p-4 pr-14 text-xs">
          <code className="font-mono">{current.code}</code>
        </pre>
      </div>
    </div>
  );
}
