import { cn } from "@/lib/utils";

export type ReceiptRowData = {
  readonly label: string;
  readonly value: string;
  /** The amount — rendered larger, since it is what the eye looks for. */
  readonly emphasis?: boolean;
  readonly tone?: "success";
};

/**
 * The label/value block on a payment confirmation.
 *
 * Shared by both success screens — the in-app one after a wallet payment and
 * the `/pay` return after Mobile Money — because they are the same artefact
 * reached two ways. Someone whose contact has not arrived screenshots whichever
 * one they landed on, so the two must carry the same facts.
 *
 * Callers pass only fields their API actually returns. Nothing here invents a
 * row to fill out the shape.
 */
export function PaymentReceipt({
  rows,
  title = "Détails du paiement",
}: Readonly<{ rows: readonly ReceiptRowData[]; title?: string }>) {
  if (rows.length === 0) return null;

  return (
    <div className="w-full text-left">
      <h2 className="mb-2 text-sm font-bold text-foreground">{title}</h2>
      <dl className="w-full space-y-2.5 rounded-xl bg-card px-4 py-3.5 shadow-soft">
        {rows.map((row) => (
          <ReceiptRow key={row.label} {...row} />
        ))}
      </dl>
    </div>
  );
}

/** Label left, value right. The value wraps so a long description cannot push
 *  the label off its row. */
function ReceiptRow({ label, value, emphasis, tone }: ReceiptRowData) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "min-w-0 text-right text-xs font-medium",
          tone === "success" ? "text-whatsapp" : "text-foreground",
          emphasis && "text-sm font-bold",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
