import { useMemo } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  NO_TIME,
  dayKey,
  formatTime,
  hasExplicitTime,
  parseValue,
  timeOptions,
  toValue,
} from "@/lib/date-time-value";

/** The Select's stand-in for "no particular hour" — Radix forbids `value=""`. */
const NO_TIME_OPTION = "none";

/**
 * A date and, optionally, an hour — as two plain fields rather than one
 * control.
 *
 * The date stays the NATIVE `<input type="date">`. On a phone that is the
 * platform's own wheel or calendar, which people already know, which is
 * translated and accessible for free, and which no amount of our own code
 * improves on. A hand-built calendar here mostly reinvented it, with worse
 * contrast between today and the selected day.
 *
 * What the native control could not do is leave the hour out:
 * `datetime-local` always demands both, and an employer often knows the day
 * and settles the time with whoever answers. So the hour is a separate,
 * optional Select — and "Heure non précisée" is a real choice in it, not an
 * empty state.
 *
 * `value` and `onChange` keep the `YYYY-MM-DDTHH:mm` shape `datetime-local`
 * used, so the schema, the submit payload and the server contract are
 * untouched by this swap. See {@link NO_TIME} for how "no hour" is stored.
 */
export function DateTimePicker({
  value,
  onChange,
  onBlur,
  min,
  disabled = false,
}: Readonly<{
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** Nothing before this instant may be chosen. */
  min: Date;
  disabled?: boolean;
}>) {
  const current = parseValue(value);
  const selectedDay = current?.day ?? null;

  const options = useMemo(
    () => (selectedDay ? timeOptions(selectedDay, min) : []),
    [selectedDay, min],
  );

  const timeValue =
    current && hasExplicitTime(current.minutesOfDay)
      ? String(current.minutesOfDay)
      : NO_TIME_OPTION;

  const onDateChange = (next: string) => {
    if (!next) {
      onChange("");
      return;
    }
    // Midday, not midnight, purely to build a Date on the right calendar day
    // whatever the timezone — only the day part of it is ever read.
    const [y, m, d] = next.split("-").map(Number);
    const day = new Date(y, m - 1, d, 12, 0);

    // Keep the hour across a date change when it is still legal — moving the
    // mission to another day should not silently clear a time already chosen.
    // It stops being legal when the new day is the floor's own day and the
    // hour has already passed, and then "no hour" is the honest fallback.
    const keep =
      current &&
      hasExplicitTime(current.minutesOfDay) &&
      timeOptions(day, min).includes(current.minutesOfDay)
        ? current.minutesOfDay
        : NO_TIME;

    onChange(toValue(day, keep));
  };

  const onTimeChange = (next: string) => {
    if (!selectedDay) return;
    onChange(
      toValue(selectedDay, next === NO_TIME_OPTION ? NO_TIME : Number(next)),
    );
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Input
        type="date"
        // The native control blocks the days the server would refuse, so an
        // invalid one is never offered rather than rejected after the fact.
        min={dayKey(min)}
        value={selectedDay ? dayKey(selectedDay) : ""}
        onChange={(e) => onDateChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        className="w-full min-w-0"
      />

      <Select
        value={timeValue}
        onValueChange={onTimeChange}
        // Nothing to offer before a day is known: which hours are still
        // available depends on which day it is.
        disabled={disabled || !selectedDay}
      >
        <SelectTrigger className="w-full min-w-0">
          <SelectValue placeholder="Heure" />
        </SelectTrigger>
        <SelectContent>
          {/* First, and a real option rather than a cleared field: leaving the
              hour out is a normal answer here, not a missing one. */}
          <SelectItem value={NO_TIME_OPTION}>Heure non précisée</SelectItem>
          {options.map((minutes) => (
            <SelectItem key={minutes} value={String(minutes)}>
              {formatTime(minutes)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
