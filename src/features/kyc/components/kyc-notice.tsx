import { AlertCircle, AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";
import { kycContent } from "@/content/kyc";
import { whatsappLink } from "@/config";
import type { KycBlockReason } from "@/hooks/use-kyc-gate";

type KycNoticeProps = Readonly<{
  reason: KycBlockReason;
  className?: string;
}>;


export function KycNotice({ reason, className }: KycNoticeProps) {
  if (reason === "REJECTED") {
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
          <p className="font-medium text-destructive">
            {kycContent.rejected.title}
          </p>
          <p className="text-muted-foreground">{kycContent.rejected.body}</p>
          <a
            href={whatsappLink(kycContent.rejected.supportMessage)}
            target="_blank"
            rel="noreferrer"
            className="inline-block font-medium text-destructive underline underline-offset-2"
          >
            {kycContent.rejected.supportLabel}
          </a>
        </div>
      </div>
    );
  }

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
      <p className="text-sm text-amber-700">{kycContent.pending.body}</p>
    </div>
  );
}

export function kycShortLabel(reason: KycBlockReason): string {
  return reason === "REJECTED"
    ? kycContent.rejected.shortLabel
    : kycContent.pending.shortLabel;
}
