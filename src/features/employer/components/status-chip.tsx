import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// A borderless, softly-tinted status chip (small rounding) used in place of the
// default bordered Badge. Pass the colour classes via `className`.
export function StatusChip({
  className,
  children,
}: Readonly<{ className?: string; children: ReactNode }>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}
