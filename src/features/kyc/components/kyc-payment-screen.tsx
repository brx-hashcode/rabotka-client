import { useNavigate } from "react-router";

import { PaymentScreen, PaymentNotice } from "@/features/payments";
import { kycContent } from "@/content/kyc";
import { whatsappLink } from "@/config";
import type { KycBlockReason } from "@/hooks/use-kyc-gate";

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
  const copy = reason === "REJECTED" ? kycContent.rejected : kycContent.pending;

  return (
    <PaymentScreen>
      <PaymentNotice
        title={copy.title}
        description={
          reason === "REJECTED" ? (
            <>
              {kycContent.rejected.body}{" "}
              <a
                href={whatsappLink(kycContent.rejected.supportMessage)}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground underline underline-offset-2"
              >
                {kycContent.rejected.supportLabel}
              </a>
            </>
          ) : (
            kycContent.pending.body
          )
        }
        actionLabel={backLabel}
        onAction={() => navigate(backTo)}
      />
    </PaymentScreen>
  );
}
