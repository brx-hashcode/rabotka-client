import { useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export type ComboboxOption = { id: string; name: string };

type CategoryComboboxProps = {
  readonly options: ComboboxOption[];
  readonly value: string | null;
  readonly onChange: (id: string | null) => void;
  readonly placeholder?: string;
  /** When set, shows a first "clear" option that sets the value to null. */
  readonly allLabel?: string;
  readonly disabled?: boolean;
  readonly triggerClassName?: string;
  /**
   * Portal target for the dropdown. Pass the enclosing Sheet/Dialog content so
   * the list renders inside its scroll-lock and stays scrollable; defaults to
   * document.body (fine on a normal page).
   */
  readonly container?: HTMLElement | null;
};

export function CategoryCombobox({
  options,
  value,
  onChange,
  placeholder = "Choisir…",
  allLabel,
  disabled,
  triggerClassName,
  container,
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50",
            !selected && "text-muted-foreground",
            triggerClassName,
          )}
        >
          <span className="truncate">
            {selected ? selected.name : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal container={container ?? undefined}>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          collisionPadding={8}
          className="z-50 w-[--radix-popover-trigger-width] max-w-[calc(100vw-1rem)] rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <Command>
            <CommandInput placeholder="Rechercher…" />
            <CommandList className="max-h-56">
              <CommandEmpty>Aucun résultat.</CommandEmpty>
              <CommandGroup>
                {allLabel && (
                  <CommandItem
                    value={allLabel}
                    className="data-[selected=true]:bg-whatsapp data-[selected=true]:text-white"
                    onSelect={() => {
                      onChange(null);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        !value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {allLabel}
                  </CommandItem>
                )}
                {options.map((o) => (
                  <CommandItem
                    key={o.id}
                    value={o.name}
                    className="data-[selected=true]:bg-whatsapp data-[selected=true]:text-white"
                    onSelect={() => {
                      onChange(o.id === value ? null : o.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        value === o.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {o.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
