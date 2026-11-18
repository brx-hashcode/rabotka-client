import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type NativeSelectOption = Readonly<{ value: string; label: string }>;

type NativeSelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "value" | "onChange" | "children"
> & {
  readonly options: readonly NativeSelectOption[];
  /** "" or null: nothing chosen yet. */
  readonly value: string | null | undefined;
  readonly onValueChange: (value: string) => void;
  /** Shown while nothing is chosen; not selectable. */
  readonly placeholder?: string;
  /**
   * A first, selectable option meaning « no filter » (value ""). When set it
   * stands in for the placeholder.
   */
  readonly allLabel?: string;
};

/**
 * The app's one picker: a real `<select>`.
 *
 * On a phone it opens the system's own picker — a wheel on iOS, a sheet on
 * Android — so there is no keyboard to pop up, no popover to reposition, and
 * nothing behind it to scroll. The custom comboboxes it replaces did all
 * three, and on a narrow screen the result shook under the finger.
 *
 * Styled like the text fields (same height, radius and ring). `text-base` on
 * purpose: below 16px, iOS zooms the page on focus.
 */
export const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  NativeSelectProps
>(function NativeSelect(
  { options, value, onValueChange, placeholder, allLabel, className, ...props },
  ref,
) {
  const current = value ?? "";
  const known = current === "" || options.some((o) => o.value === current);

  return (
    <div className="relative w-full">
      <select
        ref={ref}
        value={current}
        onChange={(event) => onValueChange(event.target.value)}
        className={cn(
          "h-12 w-full appearance-none truncate rounded-2xl border-0 bg-card pl-4 pr-10 text-base ring-1 ring-inset ring-border focus:outline-none focus:ring-2 focus:ring-lime-foreground/25 disabled:cursor-not-allowed disabled:opacity-50",
          current === "" && !allLabel && "text-muted-foreground",
          className,
        )}
        {...props}
      >
        {allLabel !== undefined ? (
          <option value="">{allLabel}</option>
        ) : (
          <option value="" disabled hidden>
            {placeholder ?? "Choisir…"}
          </option>
        )}
        {/* A stored value the list no longer offers still shows as itself
            rather than snapping to the first option. */}
        {!known && <option value={current}>{current}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 opacity-50"
      />
    </div>
  );
});
