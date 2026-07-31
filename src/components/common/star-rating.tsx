import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const RATING_LABELS: Record<number, string> = {
  1: "Très insuffisant",
  2: "Insuffisant",
  3: "Correct",
  4: "Très bien",
  5: "Excellent",
};

type StarRatingProps = {
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly disabled?: boolean;
  /** Star size in px. Defaults to 36 (input) — pass smaller for compact display. */
  readonly size?: number;
  /** Show the textual label under the stars. */
  readonly showLabel?: boolean;
};

export function StarRating({
  value,
  onChange,
  disabled,
  size = 36,
  showLabel = true,
}: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1.5" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
            aria-pressed={value === star}
            onMouseEnter={() => !disabled && setHover(star)}
            onClick={() => !disabled && onChange(star)}
            className={cn(
              "rounded-md p-0.5 transition-transform disabled:cursor-default",
              !disabled && "hover:scale-110 active:scale-95",
            )}
          >
            <Star
              style={{ width: size, height: size }}
              className={cn(
                "transition-colors",
                star <= active
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-muted-foreground/40",
              )}
            />
          </button>
        ))}
      </div>
      {showLabel && (
        <p className="h-5 text-sm font-medium text-muted-foreground">
          {active ? RATING_LABELS[active] : "Sélectionnez une note"}
        </p>
      )}
    </div>
  );
}
