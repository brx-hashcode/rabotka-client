import * as React from "react";
import { ChevronDown } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import fr from "react-phone-number-input/locale/fr.json";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PhoneNumberInputRoot = RPNInput.default;

type PhoneInputProps = Omit<
  React.ComponentProps<"input">,
  "onChange" | "value" | "ref"
> &
  Omit<RPNInput.Props<typeof PhoneNumberInputRoot>, "onChange"> & {
    onChange?: (value: RPNInput.Value) => void;
  };

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
  React.forwardRef<
    React.ComponentRef<typeof PhoneNumberInputRoot>,
    PhoneInputProps
  >(
    (
      {
        className,
        onChange,
        value,
        // No `countries` default: react-phone-number-input offers every
        // country when the prop is absent. It used to be pinned to Central
        // Africa, which meant anyone outside it simply could not enter their
        // own number — and the profile now records a country worldwide, so the
        // two would have disagreed.
        countries,
        ...props
      },
      ref,
    ) => {
      return (
        <PhoneNumberInputRoot
          ref={ref}
          className={cn(
            "flex h-12 items-stretch overflow-hidden rounded-2xl bg-card ring-1 ring-inset ring-border focus-within:ring-2 focus-within:ring-lime-foreground/25",
            className,
          )}
          countries={countries}
          // Country names in French, in the flag picker.
          labels={fr}
          flagComponent={FlagComponent}
          countrySelectComponent={CountrySelect}
          inputComponent={InputComponent}
          smartCaret={false}
          value={value || undefined}
          /**
           * Handles the onChange event.
           *
           * react-phone-number-input might trigger the onChange event as undefined
           * when a valid phone number is not entered. To prevent this,
           * the value is coerced to an empty string.
           *
           * @param {E164Number | undefined} value - The entered value
           */
          onChange={(value) => onChange?.(value || ("" as RPNInput.Value))}
          {...props}
        />
      );
    },
  );
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => (
  <Input
    className={cn(
      // The root draws the field (white, rounded, one ring). This inner
      // input is plain: no ring, background or rounding of its own, or it
      // drew a second pill inside the first.
      "h-full rounded-none border-0 bg-transparent pl-1 shadow-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
      className,
    )}
    {...props}
    ref={ref}
  />
));
InputComponent.displayName = "InputComponent";

type CountryEntry = { label: string; value: RPNInput.Country | undefined };

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  options: CountryEntry[];
  onChange: (country: RPNInput.Country) => void;
};

/**
 * The flag button, with a real `<select>` laid invisibly over it.
 *
 * Tapping the flag opens the system's own picker — a wheel on iOS, a sheet
 * on Android — in French, with each dialling code. The popover it replaces had
 * a search box that opened the keyboard and a list that dragged the page
 * behind it on a phone. The flag stays what you see; the select is only what
 * your finger lands on.
 */
const CountrySelect = ({
  disabled,
  value: selectedCountry,
  options: countryList,
  onChange,
}: CountrySelectProps) => (
  <div className="relative flex h-full shrink-0 items-center gap-1 px-3">
    <FlagComponent country={selectedCountry} countryName={selectedCountry} />
    <ChevronDown
      aria-hidden
      className={cn("size-4 opacity-50", disabled && "hidden")}
    />
    <select
      aria-label="Indicatif du pays"
      disabled={disabled}
      value={selectedCountry ?? ""}
      onChange={(event) => onChange(event.target.value as RPNInput.Country)}
      // text-base: below 16px, iOS zooms the page when the picker opens.
      className="absolute inset-0 cursor-pointer appearance-none opacity-0 text-base disabled:cursor-not-allowed"
    >
      {countryList.map(({ value, label }) =>
        value ? (
          <option key={value} value={value}>
            {label} (+{RPNInput.getCountryCallingCode(value)})
          </option>
        ) : null,
      )}
    </select>
  </div>
);

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 [&_svg:not([class*='size-'])]:size-full">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};

export { PhoneInput };
