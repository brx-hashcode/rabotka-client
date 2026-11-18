import { X } from "lucide-react";

import { NativeSelect } from "@/components/ui/native-select";

export type MultiSelectOption = Readonly<{
  id: string;
  name: string;
  icon?: string | null;
}>;

type CategoryMultiSelectProps = Readonly<{
  options: readonly MultiSelectOption[];
  value: readonly string[];
  onChange: (next: string[]) => void;
  max: number;
  /** The first, empty picker. */
  placeholder: string;
  /** The picker that adds one more, once at least one is chosen. */
  addLabel: string;
  removeLabel?: string;
  disabled?: boolean;
}>;

/**
 * Several trades, each in its own native `<select>`.
 *
 * Replaces chips under a search box. The search opened the keyboard, and
 * forty chips made a long, shifting wall on a phone. Here every chosen trade
 * is one row (change it, or remove it with the cross), and one more picker
 * adds the next until `max`. Each picker is the system's own, like every other
 * picker in the app, and only offers what is not chosen yet.
 */
export function CategoryMultiSelect({
  options,
  value,
  onChange,
  max,
  placeholder,
  addLabel,
  removeLabel = "Retirer",
  disabled,
}: CategoryMultiSelectProps) {
  const label = (o: MultiSelectOption) =>
    o.icon ? `${o.icon} ${o.name}` : o.name;
  const available = (keep?: string) =>
    options
      .filter((o) => o.id === keep || !value.includes(o.id))
      .map((o) => ({ value: o.id, label: label(o) }));

  return (
    <div className="flex flex-col gap-2">
      {value.map((id, index) => (
        <div key={id} className="flex items-center gap-2">
          <NativeSelect
            options={available(id)}
            value={id}
            disabled={disabled}
            onValueChange={(next) => {
              if (!next) return;
              onChange(value.map((v, i) => (i === index ? next : v)));
            }}
          />
          <button
            type="button"
            aria-label={removeLabel}
            disabled={disabled}
            onClick={() => onChange(value.filter((_, i) => i !== index))}
            className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-card text-muted-foreground ring-1 ring-inset ring-border disabled:opacity-50"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ))}
      {value.length < max && (
        <NativeSelect
          // Remounted after each pick so it falls back to its placeholder.
          key={value.join(",")}
          options={available()}
          value=""
          disabled={disabled}
          placeholder={value.length === 0 ? placeholder : addLabel}
          onValueChange={(next) => {
            if (next) onChange([...value, next]);
          }}
        />
      )}
    </div>
  );
}
