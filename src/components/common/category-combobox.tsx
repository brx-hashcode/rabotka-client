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
import { foldedCommandFilter } from "@/lib/search";

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
   * Hands search back to the parent. When set, cmdk's own filtering is turned
   * OFF and `options` is taken as already filtered — which is the only way to
   * serve a list too long to put in the DOM (some countries have 15 000
   * cities; rendering them all locks up the phone).
   */
  readonly search?: string;
  readonly onSearchChange?: (value: string) => void;
  /** Shown under the list when results were capped. */
  readonly footnote?: string;
  /**
   * Portal target for the dropdown. Pass the enclosing Sheet/Dialog content so
   * the list renders inside its scroll-lock and stays scrollable; defaults to
   * document.body (fine on a normal page).
   */
  readonly container?: HTMLElement | null;
  /**
   * Called once the picker closes, i.e. the user is done with this field.
   *
   * Wired to react-hook-form's `field.onBlur` by callers that want the
   * touched state. Fired on close rather than on the trigger's own blur
   * because opening the popover moves focus into it — which would mark the
   * field touched at the very moment the user started engaging with it.
   */
  readonly onBlur?: () => void;
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
  search,
  onSearchChange,
  footnote,
  onBlur,
}: CategoryComboboxProps) {
  const controlledSearch = onSearchChange !== undefined;
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) onBlur?.();
      }}
    >
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
          // `w-(--var)` is Tailwind v4 syntax. This was `w-[--var]`, the v3
          // form, which v4 does not compile — so the popover had no width at
          // all and sat narrower than the field that opened it.
          className="z-50 w-(--radix-popover-trigger-width) max-w-[calc(100vw-1rem)] rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          {/* `filter` rather than cmdk's default: its built-in scorer compares
              raw code points, so typing "maraichage" scored 0 against
              "Agriculture & Maraîchage" and the option disappeared. Ignored
              when the parent owns the search (cities), which folds already. */}
          <Command
            shouldFilter={!controlledSearch}
            filter={foldedCommandFilter}
          >
            <CommandInput
              placeholder="Rechercher…"
              value={controlledSearch ? search : undefined}
              onValueChange={onSearchChange}
            />
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
              {footnote && (
                <p className="text-muted-foreground px-3 py-2 text-center text-xs">
                  {footnote}
                </p>
              )}
            </CommandList>
          </Command>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
