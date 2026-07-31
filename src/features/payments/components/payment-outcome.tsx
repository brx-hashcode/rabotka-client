import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";


export function PaymentSuccess({
  title = "Paiement confirmé !",
  description,
  actionLabel,
  onAction,
}: Readonly<{
  title?: string;
  description?: React.ReactNode;
  actionLabel: string;
  onAction: () => void;
}>) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center text-center animate-in fade-in duration-500">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500/10 animate-in zoom-in-50 duration-500">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
          <Check className="h-9 w-9 text-white" strokeWidth={3} />
        </div>
      </div>

      <h1 className="mt-6 text-2xl font-bold text-foreground">{title}</h1>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}

      <Button
      variant="outline"
      className="mt-8 w-full"
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </div>
  );
}

/**
 * Terminal non-success state — nothing owed, already paid, or the payment could
 * not be prepared. Same footprint as PaymentSuccess so the screen doesn't shift.
 */
export function PaymentNotice({
  title,
  description,
  actionLabel,
  onAction,
}: Readonly<{
  title: string;
  description?: React.ReactNode;
  actionLabel: string;
  onAction: () => void;
}>) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center text-center">
      <h1 className="text-xl font-bold text-foreground">{title}</h1>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}
      <Button variant="outline" className="mt-6 w-full" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}
