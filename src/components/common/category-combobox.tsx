import { NativeSelect } from "@/components/ui/native-select";

export type ComboboxOption = { id: string; name: string };

type CategoryComboboxProps = {
  readonly options: ComboboxOption[];
  readonly value: string | null;
  readonly onChange: (id: string | null) => void;
  readonly placeholder?: string;
  /** When set, a first « all » option that sets the value to null. */
  readonly allLabel?: string;
  readonly disabled?: boolean;
  readonly triggerClassName?: string;
  /**
   * Called when the person leaves the field. Wired to react-hook-form's
   * `field.onBlur` by callers that want the touched state.
   */
  readonly onBlur?: () => void;
};

/**
 * Picks one option by id: countries, cities, trades.
 *
 * A native `<select>` (see NativeSelect) since the custom popover combobox
 * shook on phones: its search box opened the keyboard, the screen shrank, the
 * list repositioned, and the page scrolled behind it. The lists it serves are
 * short now — 13 countries, two or three cities each, the trades — so the
 * system picker reads them better than a search did. The name stays so its
 * callers did not have to change.
 */
export function CategoryCombobox({
  options,
  value,
  onChange,
  placeholder = "Choisir…",
  allLabel,
  disabled,
  triggerClassName,
  onBlur,
}: CategoryComboboxProps) {
  return (
    <NativeSelect
      options={options.map((o) => ({ value: o.id, label: o.name }))}
      value={value}
      onValueChange={(id) => onChange(id === "" ? null : id)}
      placeholder={placeholder}
      allLabel={allLabel}
      disabled={disabled}
      onBlur={onBlur}
      className={triggerClassName}
    />
  );
}
