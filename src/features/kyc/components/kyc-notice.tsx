import { Link } from "react-router";
import { AlertCircle, AlertTriangle, IdCard } from "lucide-react";

import { cn } from "@/lib/utils";
import { kycContent } from "@/content/kyc";
import { KYC_VERIFICATION_PATH } from "@/lib/kyc-upload-state";
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
          <Link
            to={KYC_VERIFICATION_PATH}
            className="inline-block font-medium text-destructive underline underline-offset-2"
          >
            {kycContent.rejected.actionLabel}
          </Link>
        </div>
      </div>
    );
  }

  // Signed up without documents (« Plus tard »): nothing is being checked, so
  // the pending copy would be false. One thing to do, one link to do it.
  if (reason === "MISSING") {
    return (
      <div
        className={cn(
          "flex items-start gap-2.5 rounded-xl bg-amber-50 px-3 py-2.5",
          className,
        )}
      >
        <IdCard className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
        <div className="space-y-1 text-sm">
          <p className="font-medium text-amber-800">
            {kycContent.missing.title}
          </p>
          <p className="text-amber-700">{kycContent.missing.body}</p>
          <Link
            to={KYC_VERIFICATION_PATH}
            className="inline-block font-medium text-amber-800 underline underline-offset-2"
          >
            {kycContent.missing.actionLabel}
          </Link>
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
  switch (reason) {
    case "REJECTED":
      return kycContent.rejected.shortLabel;
    case "MISSING":
      return kycContent.missing.shortLabel;
    default:
      return kycContent.pending.shortLabel;
  }
}
