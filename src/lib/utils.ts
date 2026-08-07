import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatAmount = (amount: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
  }).format(amount);

/**
 * What a screen shows where a date would go but there isn't one.
 *
 * CDI/CDD/STAGE offers carry no closing date, so every surface that prints one
 * needs an answer. An em dash reads as "nothing here" rather than as a value.
 */
export const NO_DATE = "—";

/**
 * Both helpers accept null on purpose.
 *
 * They used to take a bare `string` and hand the result of `new Date(...)`
 * straight to `toLocale*String` with no validation — so a missing date rendered
 * "1 janv. 1970", a plausible-looking wrong answer, which is worse than an
 * obvious blank. Accepting null here is also what makes every call site a
 * compile error the day a field becomes nullable, instead of a silent 1970.
 */
export const formatDate = (dateStr: string | null | undefined) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : NO_DATE;

export const formatDateTime = (dateStr: string | null | undefined) =>
  dateStr
    ? new Date(dateStr).toLocaleString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : NO_DATE;
