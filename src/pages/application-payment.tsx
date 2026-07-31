import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { UserRound } from "lucide-react";
import {
  PaymentScreen,
  PaymentScreenSkeleton,
  PaymentMethodChooser,
  PaymentSuccess,
  PaymentNotice,
} from "@/features/payments";
import {
  useApplication,
  useAcceptApplication,
  usePayUnlockWallet,
  usePayUnlockMobile,
} from "@/hooks/use-application";

type Outcome = "awaiting-worker" | "contact-sent";

const BACK_TO = "/candidatures";
const BACK_LABEL = "Retour aux candidatures";

export default function ApplicationPayment() {
  const navigate = useNavigate();
  const { id = "" } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useApplication(id);

  const accept = useAcceptApplication(id);
  const payWallet = usePayUnlockWallet(id);
  const payMobile = usePayUnlockMobile(id);

  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const acceptTriggered = useRef(false);
  const goBack = () => navigate(BACK_TO);

  const status = data?.application.status;
  const workerName = data
    ? `${data.application.worker.firstName} ${data.application.worker.lastName}`
    : "";

  // Accept-on-entry: coming here from a still-pending application commits the
  // acceptance (creating the unlock attempt) so the fee + methods can be shown.
  useEffect(() => {
    if (!data) return;
    if (
      (status === "PENDING" || status === "VIEWED") &&
      !acceptTriggered.current &&
      !accept.isPending
    ) {
      acceptTriggered.current = true;
      accept.mutate();
    }
  }, [data, status, accept]);

  const handlePayWallet = () =>
    payWallet.mutate(undefined, {
      onSuccess: (detail) =>
        setOutcome(
          detail.application.status === "ACCEPTED"
            ? "contact-sent"
            : "awaiting-worker",
        ),
    });

  const handlePayMobile = () =>
    payMobile.mutate(undefined, {
      // Reuse the standalone token payment interface (operator + number +
      // validate), exactly like the WhatsApp payment link. Pass a return URL so
      // the pay page can offer a "Retour" button back into the app.
      onSuccess: ({ token }) =>
        navigate(`/pay/${token}?return=${encodeURIComponent(BACK_TO)}`),
    });

  const preparing =
    isLoading ||
    accept.isPending ||
    ((status === "PENDING" || status === "VIEWED") && !accept.isError);

  if (outcome) {
    return (
      <PaymentScreen>
        <PaymentSuccess
          description={
            outcome === "contact-sent" ? (
              <>
                Les coordonnées de{" "}
                <span className="font-medium text-foreground">{workerName}</span>{" "}
                vous ont été envoyées par WhatsApp.
              </>
            ) : (
              <>
                Vous avez réglé votre part. Les coordonnées de{" "}
                <span className="font-medium text-foreground">{workerName}</span>{" "}
                vous seront envoyées par WhatsApp dès que le travailleur aura payé
                sa part.
              </>
            )
          }
          actionLabel={BACK_LABEL}
          onAction={goBack}
        />
      </PaymentScreen>
    );
  }

  if (preparing) {
    return (
      <PaymentScreen>
        <PaymentScreenSkeleton />
      </PaymentScreen>
    );
  }

  if (isError || accept.isError || !data?.unlock) {
    return (
      <PaymentScreen>
        <PaymentNotice
          title="Paiement indisponible"
          description="Impossible de préparer le paiement pour cette candidature."
          actionLabel={BACK_LABEL}
          onAction={goBack}
        />
      </PaymentScreen>
    );
  }

  if (data.unlock.employerPaid) {
    return (
      <PaymentScreen>
        <PaymentNotice
          title="Part déjà réglée"
          description="Les coordonnées vous seront envoyées par WhatsApp dès que le travailleur aura payé la sienne."
          actionLabel={BACK_LABEL}
          onAction={goBack}
        />
      </PaymentScreen>
    );
  }

  return (
    <PaymentScreen>
      <PaymentMethodChooser
        icon={
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-whatsapp/10">
            <UserRound className="h-6 w-6 text-whatsapp" />
          </div>
        }
        title="Déverrouiller le contact"
        description={
          <>
            Pour{" "}
            <span className="font-medium text-foreground">
              {data.application.jobOffer.title}
            </span>{" "}
            — recevez les coordonnées de{" "}
            <span className="font-medium text-foreground">{workerName}</span> par
            WhatsApp.
          </>
        }
        amount={data.unlock.employerFee}
        amountLabel="Frais de déverrouillage"
        walletBalance={data.unlock.walletBalance}
        onPayWallet={handlePayWallet}
        walletPending={payWallet.isPending}
        onPayMobile={handlePayMobile}
        mobilePending={payMobile.isPending}
        onCancel={goBack}
      />
    </PaymentScreen>
  );
}
