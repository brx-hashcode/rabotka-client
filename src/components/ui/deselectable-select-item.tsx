import { SelectItem } from "@/components/ui/select";

type Props = {
  readonly value: string;
  /** The select's current value, so the item knows whether it is the chosen one. */
  readonly selected: string | undefined;
  /** Called with "" when the already-selected item is tapped again. */
  readonly onDeselect: () => void;
  readonly children: React.ReactNode;
};

/**
 * A `SelectItem` that clears the field when you tap the option already chosen.
 *
 * Radix fires `onValueChange` only when the value actually changes, so
 * re-selecting the current option is a no-op — which leaves an *optional* field
 * with no way back to empty once anything has been picked. The only escape was
 * reloading the form.
 *
 * Intercepted on pointer-down, before Radix's own handler runs, and the event is
 * cancelled so the select does not also re-commit the same value.
 *
 * For optional fields only. On a required one this would let the user empty a
 * field they must fill, and the error would appear to come from nowhere.
 */
export function DeselectableSelectItem({
  value,
  selected,
  onDeselect,
  children,
}: Props) {
  const isSelected = selected === value;

  return (
    <SelectItem
      value={value}
      onPointerDown={(event) => {
        if (!isSelected) return;
        event.preventDefault();
        onDeselect();
      }}
    >
      {children}
    </SelectItem>
  );
}
