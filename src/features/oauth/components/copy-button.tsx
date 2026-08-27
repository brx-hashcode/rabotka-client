import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type CopyButtonProps = {
  readonly value: string;
  readonly className?: string;
};

/**
 * Copies a code block, and says so for two seconds.
 *
 * The confirmation is the whole point: `navigator.clipboard.writeText` succeeds
 * silently, so without it a reader has no way to tell a successful copy from a
 * dead button and ends up selecting the text by hand anyway.
 */
export function CopyButton({ value, className }: Readonly<CopyButtonProps>) {
  const [copied, setCopied] = useState(false);

  // Reset on a timer, cleared on unmount so a reader who switches language tabs
  // straight after copying does not get a setState on a gone component.
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      aria-label={copied ? "Copié" : "Copier le code"}
      onClick={() => {
        navigator.clipboard
          .writeText(value)
          .then(() => setCopied(true))
          // Clipboard access is refused in some browser configurations. The
          // code is on screen and selectable, so this is a nuisance rather than
          // a failure worth interrupting anyone over.
          .catch(() => undefined);
      }}
      className={cn(
        "text-muted-foreground hover:text-foreground hover:bg-muted absolute right-2 top-2",
        "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors",
        className,
      )}
    >
      {copied ? (
        <>
          <Check aria-hidden className="text-primary size-3.5" />
          Copié
        </>
      ) : (
        <Copy aria-hidden className="size-3.5" />
      )}
    </button>
  );
}
