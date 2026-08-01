import { useState } from "react";
import { Check, Loader2, Smartphone, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatAmount } from "@/lib/utils";

type Method = "wallet" | "mobile";

type Props = {
  /** Small icon above the title (e.g. a warning for penalties). */
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
};

/**
 * The shared wallet-vs-mobile-money step. Every payment in the app (contact
 * unlock, recommendation contact, penalties) offers exactly these two methods, so
 * they all render through here rather than each page re-implementing it.
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
}: Props) {
  const insufficient = walletBalance < amount;
  const busy = Boolean(walletPending || mobilePending);

  // Preselect the cheapest path for the user so the common case is one tap.
  const [method, setMethod] = useState<Method>(
    insufficient ? "mobile" : "wallet",
  );

  const pay = () => (method === "wallet" ? onPayWallet() : onPayMobile());

  return (
    <div className="w-full max-w-sm space-y-5">
      <div className="flex flex-col items-center text-center">
        {icon}
        <h1 className="mt-3 text-xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="rounded-2xl bg-card px-5 py-4 text-center shadow-soft">
        <p className="text-xs text-muted-foreground">{amountLabel}</p>
        <p className="mt-1 text-3xl font-bold text-foreground">
          {amount.toLocaleString("fr-FR")}
          <span className="ml-2 text-base font-medium text-muted-foreground">
            FCFA
          </span>
        </p>
      </div>

      <div className="space-y-2.5">
        <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Comment souhaitez-vous payer ?
        </p>

        <div role="radiogroup" aria-label="Moyen de paiement" className="space-y-2.5">
          <MethodOption
            icon={<Wallet className="h-5 w-5" />}
            label="Mon portefeuille"
            hint={
              insufficient
                ? `Solde insuffisant : ${formatAmount(walletBalance)}`
                : `Solde : ${formatAmount(walletBalance)}`
            }
            hintTone={insufficient ? "warning" : "muted"}
            selected={method === "wallet"}
            disabled={insufficient || busy}
            onSelect={() => setMethod("wallet")}
          />
          <MethodOption
            icon={<Smartphone className="h-5 w-5" />}
            label="Mobile Money"
            hint="MTN / Airtel — paiement sur votre téléphone"
            selected={method === "mobile"}
            disabled={busy}
            onSelect={() => setMethod("mobile")}
          />
        </div>
      </div>

      <div className="space-y-1.5">
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

function MethodOption({
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
        "flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-colors disabled:opacity-50",
        selected ? "bg-whatsapp-light shadow-soft" : "bg-card shadow-soft",
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors",
          selected
            ? "bg-whatsapp text-primary-foreground"
            : "bg-whatsapp/10 text-whatsapp",
        )}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p
          className={cn(
            "text-xs",
            hintTone === "warning" ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {hint}
        </p>
      </div>

      {/* Filled dot instead of an outlined radio: the app has no borders. */}
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors",
          selected ? "bg-whatsapp text-primary-foreground" : "bg-secondary",
        )}
      >
        {selected && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
    </button>
  );
}
