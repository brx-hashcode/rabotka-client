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
import { useWorkerMission } from "@/hooks/use-worker-mission";
import {
  useWorkerUnlock,
  usePayWorkerUnlockWallet,
  usePayWorkerUnlockMobile,
} from "@/hooks/use-worker-unlock";
import { QueryErrorState } from "@/components/common/query-error-state";
import { isNetworkError, serverMessage } from "@/lib/api/errors";
import { useKycGate } from "@/hooks/use-kyc-gate";
import { KycPaymentScreen } from "@/features/kyc";

type Outcome = "awaiting-employer" | "contact-sent";

const BACK_TO = "/mes-candidatures";
const BACK_LABEL = "Retour à mes candidatures";

/**
 * The worker's half of the contact unlock.
 *
 * Mirrors the employer's application-payment screen and reuses the same shared
 * payment components. Until this existed a worker whose employer had already
 * paid was stuck on "Paiement requis" with no way to complete the unlock — the
 * only route was the WhatsApp flow.
 */
export default function WorkerMissionPayment() {
  const navigate = useNavigate();
  const { id = "" } = useParams<{ id: string }>();

  const { data: mission, isLoading: missionLoading } = useWorkerMission(id);
  const { data, isLoading, isError, error, isFetching, refetch } =
    useWorkerUnlock(id);
  const payWallet = usePayWorkerUnlockWallet(id);
  const payMobile = usePayWorkerUnlockMobile(id);

  const { blocked, reason } = useKycGate();
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const goBack = () => navigate(BACK_TO);

  const employerName = mission
    ? `${mission.employer.firstName} ${mission.employer.lastName}`
    : "";

  const handlePayWallet = () =>
    payWallet.mutate(undefined, {
      onSuccess: (result) =>
        // Both sides paid → contacts go out now; otherwise we wait on the employer.
        setOutcome(
          result.unlock?.employerPaid ? "contact-sent" : "awaiting-employer",
        ),
    });

  const handlePayMobile = () =>
    payMobile.mutate(undefined, {
      onSuccess: ({ token }) =>
        navigate(`/pay/${token}?return=${encodeURIComponent(BACK_TO)}`),
    });

  // Ahead of every other branch: this route is reachable by direct URL, so the
  // gate has to cover the page, not just the pay buttons.
  if (blocked && reason) {
    return <KycPaymentScreen reason={reason} backTo={BACK_TO} />;
  }

  if (outcome) {
    return (
      <PaymentScreen>
        <PaymentSuccess
          description={
            outcome === "contact-sent" ? (
              <>
                Les coordonnées de{" "}
                <span className="font-medium text-foreground">
                  {employerName}
                </span>{" "}
                vous ont été envoyées par WhatsApp.
              </>
            ) : (
              <>
                Vous avez réglé votre part. Les coordonnées de{" "}
                <span className="font-medium text-foreground">
                  {employerName}
                </span>{" "}
                vous seront envoyées par WhatsApp dès que le recruteur aura payé
                la sienne.
              </>
            )
          }
          actionLabel={BACK_LABEL}
          onAction={goBack}
        />
      </PaymentScreen>
    );
  }

  if (isLoading || missionLoading) {
    return (
      <PaymentScreen>
        <PaymentScreenSkeleton />
      </PaymentScreen>
    );
  }

  // A dropped request says nothing about the unlock and is worth retrying.
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
    // The server distinguishes "no unlock pending" from other refusals; prefer
    // its wording over a guess.
    return (
      <PaymentScreen>
        <PaymentNotice
          title="Paiement indisponible"
          description={
            serverMessage(error) ??
            "Cette candidature n'a pas de déverrouillage en attente."
          }
          actionLabel={BACK_LABEL}
          onAction={goBack}
        />
      </PaymentScreen>
    );
  }

  if (data.unlock.workerPaid) {
    return (
      <PaymentScreen>
        <PaymentNotice
          title="Part déjà réglée"
          description={
            data.unlock.employerPaid
              ? "Les coordonnées vous ont été envoyées par WhatsApp."
              : "Les coordonnées vous seront envoyées par WhatsApp dès que le recruteur aura payé sa part."
          }
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
              {mission?.jobOffer.title}
            </span>{" "}
            — recevez les coordonnées de{" "}
            <span className="font-medium text-foreground">{employerName}</span>{" "}
            par WhatsApp.
          </>
        }
        amount={data.unlock.workerFee}
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
