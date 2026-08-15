import { useState } from "react";
import { AlertCircle, AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";
import { accountContent } from "@/content/account";
import { SupportContactDrawer } from "@/features/support";
import type { AccountBlockReason } from "@/hooks/use-account-gate";

type AccountNoticeProps = Readonly<{
  reason: AccountBlockReason;
  className?: string;
}>;

/**
 * Why the apply button is dead. Rendered above it rather than in a toast on
 * click: a suspended worker can still browse, so they need the reason visible
 * while they read the offer, not after a failed attempt.
 */
export function AccountNotice({ reason, className }: AccountNoticeProps) {
  const [supportOpen, setSupportOpen] = useState(false);

  if (reason === "PENDING_ACTIVATION") {
    return (
      <div
        className={cn(
          "flex items-start gap-2.5 rounded-xl bg-amber-50 px-3 py-2.5",
          className,
        )}
      >
        <AlertCircle
          className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
          aria-hidden
        />
        <p className="text-sm text-amber-700">
          {accountContent.pendingActivation.body}
        </p>
      </div>
    );
  }

  const copy =
    reason === "BANNED" ? accountContent.banned : accountContent.suspended;

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl bg-destructive/10 px-3 py-2.5",
        className,
      )}
    >
      <AlertTriangle
        className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
        aria-hidden
      />
      <div className="space-y-1 text-sm">
        <p className="font-medium text-destructive">{copy.title}</p>
        <p className="text-muted-foreground">{copy.body}</p>
        {/* Opens the coordinates sheet rather than jumping straight into
            WhatsApp: phone and email live in SystemConfig too, and not everyone
            wants to chat. The reason still rides along as the prefill. */}
        <button
          type="button"
          onClick={() => setSupportOpen(true)}
          className="inline-block font-medium text-destructive underline underline-offset-2"
        >
          {copy.supportLabel}
        </button>
      </div>

      <SupportContactDrawer
        open={supportOpen}
        onOpenChange={setSupportOpen}
        message={copy.supportMessage}
      />
    </div>
  );
}

export function accountShortLabel(reason: AccountBlockReason): string {
  if (reason === "BANNED") return accountContent.banned.shortLabel;
  if (reason === "SUSPENDED") return accountContent.suspended.shortLabel;
  return accountContent.pendingActivation.shortLabel;
}
