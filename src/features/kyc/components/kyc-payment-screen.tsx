import { useNavigate } from "react-router";

import { PaymentScreen, PaymentNotice } from "@/features/payments";
import { kycContent } from "@/content/kyc";
import type { KycBlockReason } from "@/hooks/use-kyc-gate";
import { KYC_VERIFICATION_PATH } from "@/lib/kyc-upload-state";

type KycPaymentScreenProps = Readonly<{
  reason: KycBlockReason;
  /** Where "Retour" goes — the list the user came from. */
  backTo: string;
  backLabel?: string;
}>;

/**
 * Stands in for a whole payment/action page that KYC has closed off.
 *
 * Full-page rather than a disabled button because these routes ARE the action:
 * they can be opened directly by URL, and one of them commits an acceptance on
 * mount. Replacing the page is the only thing that covers both.
 */
export function KycPaymentScreen({
  reason,
  backTo,
  backLabel = kycContent.screen.backLabel,
}: KycPaymentScreenProps) {
  const navigate = useNavigate();

  // Missing or refused documents have something to do: the action opens the
  // page that sends them. Under review, there is nothing to do but go back.
  if (reason === "MISSING" || reason === "REJECTED") {
    const copy = reason === "MISSING" ? kycContent.missing : kycContent.rejected;
    return (
      <PaymentScreen>
        <PaymentNotice
          title={copy.title}
          description={copy.body}
          actionLabel={copy.actionLabel}
          onAction={() => navigate(KYC_VERIFICATION_PATH)}
        />
      </PaymentScreen>
    );
  }

  return (
    <PaymentScreen>
      <PaymentNotice
        title={kycContent.pending.title}
        description={kycContent.pending.body}
        actionLabel={backLabel}
        onAction={() => navigate(backTo)}
      />
    </PaymentScreen>
  );
}
