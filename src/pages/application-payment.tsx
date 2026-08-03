import { useState } from "react";
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
  usePayUnlockWallet,
  usePayUnlockMobile,
} from "@/hooks/use-application";
import { QueryErrorState } from "@/components/common/query-error-state";
import { isNetworkError, serverMessage } from "@/lib/api/errors";
import { useKycGate } from "@/hooks/use-kyc-gate";
import { KycPaymentScreen } from "@/features/kyc";

type Outcome = "awaiting-worker" | "contact-sent";

const BACK_TO = "/candidatures";
const BACK_LABEL = "Retour aux candidatures";

/**
 * Gate wrapper. Kept as a wrapper rather than an early return in the body so a
 * blocked user never mounts the payment screen at all — this route is reachable
 * by direct URL, so the gate has to cover the page, not just the pay buttons.
 */
export default function ApplicationPayment() {
  const { blocked, reason } = useKycGate();

  if (blocked && reason) {
    return <KycPaymentScreen reason={reason} backTo={BACK_TO} />;
  }
  return <ApplicationPaymentInner />;
}

function ApplicationPaymentInner() {
  const navigate = useNavigate();
  const { id = "" } = useParams<{ id: string }>();
  const { data, isLoading, isError, error, isFetching, refetch } =
    useApplication(id);

  const payWallet = usePayUnlockWallet(id);
  const payMobile = usePayUnlockMobile(id);

  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const goBack = () => navigate(BACK_TO);

  const status = data?.application.status;
  const workerName = data
    ? `${data.application.worker.firstName} ${data.application.worker.lastName}`
    : "";

  // Still awaiting a decision — the acceptance is committed on the detail page,
  // behind a confirmation. Reaching this URL directly means there is no unlock
  // to pay for yet, so send the employer back to decide rather than accepting
  // on their behalf.
  const undecided = status === "PENDING" || status === "VIEWED";

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

  if (isLoading) {
    return (
      <PaymentScreen>
        <PaymentScreenSkeleton />
      </PaymentScreen>
    );
  }

  if (undecided) {
    return (
      <PaymentScreen>
        <PaymentNotice
          title="Candidature en attente"
          description="Acceptez d'abord cette candidature pour régler les frais de déverrouillage."
          secondaryLabel="Voir la candidature"
          onSecondary={() => navigate(`/candidatures/${id}`)}
          actionLabel={BACK_LABEL}
          onAction={goBack}
        />
      </PaymentScreen>
    );
  }

  // A dropped request is not the same failure as a refused one: it says nothing
  // about the candidature and is worth retrying, so it gets its own state
  // rather than the server-reason notice.
  if (isNetworkError(error)) {
    return (
      <PaymentScreen>
        <QueryErrorState
          message="Impossible de charger ce paiement."
          onRetry={refetch}
          isRetrying={isFetching}
        />
      </PaymentScreen>
    );
  }

  if (isError || !data?.unlock) {
    // Prefer the server's own words: it distinguishes a filled offer (409) from
    // a penalised account (403), and the generic sentence told the employer
    // neither — the real reason only ever appeared in a transient toast.
    const reason = serverMessage(error);
    const penalised = reason?.toLowerCase().includes("pénalisé");
    return (
      <PaymentScreen>
        <PaymentNotice
          title="Paiement indisponible"
          description={
            reason ??
            "Impossible de préparer le paiement pour cette candidature."
          }
          secondaryLabel={penalised ? "Régler mes pénalités" : undefined}
          onSecondary={
            penalised ? () => navigate("/penalites/paiement") : undefined
          }
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
