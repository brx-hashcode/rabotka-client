import { useNavigate } from "react-router";

import { PaymentScreen, PaymentNotice } from "@/features/payments";
import { accountContent } from "@/content/account";
import { whatsappLink } from "@/config";
import type { AccountBlockReason } from "@/hooks/use-account-gate";

type AccountPaymentScreenProps = Readonly<{
  reason: AccountBlockReason;
  /** Where "Retour" goes — the list the user came from. */
  backTo: string;
  backLabel?: string;
}>;

/**
 * Stands in for a whole payment/action page that the account status has closed
 * off. The account-status twin of `KycPaymentScreen`, for the same reason it
 * exists: these routes ARE the action, they can be opened directly by URL, and
 * a disabled button on the previous screen does not cover that.
 *
 * Both suspended and banned point at support, since only an admin can lift
 * either; a pending activation resolves on its own, so it does not.
 */
export function AccountPaymentScreen({
  reason,
  backTo,
  backLabel = "Retour",
}: AccountPaymentScreenProps) {
  const navigate = useNavigate();

  const copy =
    reason === "BANNED"
      ? accountContent.banned
      : reason === "SUSPENDED"
        ? accountContent.suspended
        : accountContent.pendingActivation;

  const supportable = reason === "BANNED" || reason === "SUSPENDED";

  return (
    <PaymentScreen>
      <PaymentNotice
        title={copy.title}
        description={
          supportable && "supportLabel" in copy ? (
            <>
              {copy.body}{" "}
              <a
                href={whatsappLink(copy.supportMessage)}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground underline underline-offset-2"
              >
                {copy.supportLabel}
              </a>
            </>
          ) : (
            copy.body
          )
        }
        actionLabel={backLabel}
        onAction={() => navigate(backTo)}
      />
    </PaymentScreen>
  );
}
