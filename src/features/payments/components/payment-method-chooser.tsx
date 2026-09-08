import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Loader2,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatAmount } from "@/lib/utils";

type Method = "wallet" | "mobile";

type Props = {
  /** Leading visual of the subject card — an avatar, or an icon for penalties. */
  readonly icon?: React.ReactNode;
  readonly title: string;
  /** ReactNode so callers can emphasise names inline. */
  readonly description?: React.ReactNode;
  readonly amount: number;
  readonly amountLabel?: string;
  readonly walletBalance: number;
  readonly onPayWallet: () => void;
  readonly walletPending?: boolean;
  readonly onPayMobile: () => void;
  readonly mobilePending?: boolean;
  /** Required: with no header and no tab bar this is the only way out. */
  readonly onCancel: () => void;
  readonly cancelLabel?: string;
  /**
   * One line of reassurance under the CTA — a refund promise, what arrives
   * after payment. Optional because it is only honest for some flows: an
   * unlock is refunded if the other side never confirms, a penalty is not.
   */
  readonly note?: React.ReactNode;
};

/**
 * The shared wallet-vs-mobile-money step. Every payment in the app (contact
 * unlock, recommendation contact, penalties) offers exactly these two methods, so
 * they all render through here rather than each page re-implementing it.
 *
 * Laid out as a checkout: a bar naming the action, a card describing what is
 * being bought and for how much, then the choice, then one commit button. The
 * previous version stacked everything centred, which gave the charge and the
 * two options identical weight and left the eye no entry point.
 *
 * The methods are a radio group, not two action buttons: tapping one only
 * selects it, and the single primary CTA at the bottom charges. Cards that pay
 * on tap read as passive info rows and give no confirmation step before money
 * moves.
 *
 * The wallet option disables itself when the balance is short instead of failing
 * on submit.
 */
export function PaymentMethodChooser({
  icon,
  title,
  description,
  amount,
  amountLabel = "Montant à régler",
  walletBalance,
  onPayWallet,
  walletPending,
  onPayMobile,
  mobilePending,
  onCancel,
  cancelLabel = "Annuler",
  note,
}: Props) {
  const insufficient = walletBalance < amount;
  const busy = Boolean(walletPending || mobilePending);

  // Preselect the cheapest path for the user so the common case is one tap.
  const [method, setMethod] = useState<Method>(
    insufficient ? "mobile" : "wallet",
  );

  const pay = () => (method === "wallet" ? onPayWallet() : onPayMobile());

  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Action bar. The back arrow duplicates the Annuler button on purpose:
          this route is reachable by direct URL, and the top-left arrow is where
          a thumb goes first. */}
      <div className="relative flex items-center justify-center">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          aria-label={cancelLabel}
          className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full bg-card text-foreground shadow-soft transition-opacity disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-base font-bold text-foreground">{title}</h1>
      </div>

      {/* What is being paid for, and how much — one card, read left to right. */}
      <div className="flex items-center gap-3.5 rounded-xl bg-card p-3.5 shadow-soft">
        {icon && <div className="shrink-0">{icon}</div>}
        <div className="min-w-0 flex-1">
          {description && (
            <p className="text-sm leading-snug text-muted-foreground">
              {description}
            </p>
          )}
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            {amountLabel} :{" "}
            <span className="text-base font-bold text-foreground">
              {amount.toLocaleString("fr-FR")} FCFA
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        <h2 className="text-sm font-bold text-foreground">
          Comment souhaitez-vous payer ?
        </h2>

        {/* Two options, so two tiles side by side rather than a stacked list —
            both choices are visible at once and neither looks like the default
            by position alone. */}
        <div
          role="radiogroup"
          aria-label="Moyen de paiement"
          className="grid grid-cols-2 gap-2.5"
        >
          <MethodTile
            icon={<Wallet className="h-5 w-5" />}
            label="Mon portefeuille"
            hint={
              insufficient
                ? `Solde insuffisant : ${formatAmount(walletBalance)}`
                : // Naming what is left afterwards answers the question the
                  // reader is actually asking.
                  `Solde : ${formatAmount(walletBalance)}`
            }
            hintTone={insufficient ? "warning" : "muted"}
            selected={method === "wallet"}
            disabled={insufficient || busy}
            onSelect={() => setMethod("wallet")}
          />
          <MethodTile
            icon={<Smartphone className="h-5 w-5" />}
            label="Mobile Money"
            hint="MTN / Airtel — confirmation sur votre téléphone"
            selected={method === "mobile"}
            disabled={busy}
            onSelect={() => setMethod("mobile")}
          />
        </div>

        {method === "wallet" && !insufficient && (
          <p className="px-1 text-xs text-muted-foreground">
            Il vous restera{" "}
            <span className="font-medium text-foreground">
              {formatAmount(walletBalance - amount)}
            </span>{" "}
            après ce paiement.
          </p>
        )}
      </div>

      <div className="space-y-1">
        {/* No `rounded-full` here. The reference design uses a pill, but every
            other button in this app is the Button primitive's `rounded-md`, and
            one pill on one screen reads as a mistake rather than a highlight. */}
        <Button
          variant="whatsapp"
          size="lg"
          className="w-full"
          disabled={busy}
          onClick={pay}
        >
          {busy ? (
            <>
              <Loader2 className="animate-spin" />
              Paiement en cours…
            </>
          ) : (
            `Payer ${amount.toLocaleString("fr-FR")} FCFA`
          )}
        </Button>

        {note && (
          <p className="flex items-center justify-center gap-1.5 pt-2 text-center text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-whatsapp" />
            {note}
          </p>
        )}

        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          disabled={busy}
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>
      </div>
    </div>
  );
}

function MethodTile({
  icon,
  label,
  hint,
  hintTone = "muted",
  selected,
  disabled,
  onSelect,
}: Readonly<{
  icon: React.ReactNode;
  label: string;
  hint: string;
  hintTone?: "muted" | "warning";
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}>) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        // A deliberate exception to the app's borderless rule, asked for to
        // match the reference: the active tile is outlined as well as tinted.
        // Selection is the one state where tint alone is ambiguous — the light
        // green is close enough to white on a dim screen to be missed.
        //
        // The unselected tile carries a TRANSPARENT border of the same width,
        // so selecting does not shift the grid by a pixel.
        "flex h-full flex-col gap-2 rounded-xl border p-3.5 text-left transition-colors disabled:opacity-50",
        selected
          ? "border-whatsapp bg-whatsapp-light shadow-soft"
          : "border-transparent bg-card shadow-soft",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
            selected
              ? "bg-whatsapp text-primary-foreground"
              : "bg-whatsapp/10 text-whatsapp",
          )}
        >
          {icon}
        </span>
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors",
            // `muted` rather than `secondary` when unselected: the latter is a
            // warm tan that read as a disabled control rather than an empty
            // choice.
            selected ? "bg-whatsapp text-primary-foreground" : "bg-muted",
          )}
        >
          {selected && <Check className="h-3 w-3" strokeWidth={3} />}
        </span>
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold leading-tight text-foreground">
          {label}
        </p>
        <p
          className={cn(
            "mt-1 text-xs leading-snug",
            hintTone === "warning"
              ? "text-destructive"
              : "text-muted-foreground",
          )}
        >
          {hint}
        </p>
      </div>
    </button>
  );
}
