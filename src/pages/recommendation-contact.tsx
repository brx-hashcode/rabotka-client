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
  useRecommendedWorker,
  usePayRecommendationWallet,
  usePayRecommendationMobile,
} from "@/hooks/use-recommendations";
import { QueryErrorState } from "@/components/common/query-error-state";
import { isNetworkError, serverMessage } from "@/lib/api/errors";
import { useKycGate } from "@/hooks/use-kyc-gate";
import { KycPaymentScreen } from "@/features/kyc";

const BACK_TO = "/home";

export default function RecommendationContact() {
  const navigate = useNavigate();
  const { workerId = "" } = useParams<{ workerId: string }>();
  const { data, isLoading, isError, error, isFetching, refetch } =
    useRecommendedWorker(workerId);
  const payWallet = usePayRecommendationWallet(workerId);
  const payMobile = usePayRecommendationMobile(workerId);

  const { blocked, reason } = useKycGate();
  const [paid, setPaid] = useState(false);
  const goBack = () => navigate(BACK_TO);

  const worker = data?.worker;
  const workerName = worker
    ? `${worker.firstName} ${worker.lastName}`
    : "ce travailleur";

  const handlePayWallet = () =>
    payWallet.mutate(undefined, { onSuccess: () => setPaid(true) });

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

  if (paid) {
    return (
      <PaymentScreen>
        <PaymentSuccess
          description={
            <>
              Les coordonnées de{" "}
              <span className="font-medium text-foreground">{workerName}</span>{" "}
              vous ont été envoyées par WhatsApp.
            </>
          }
          actionLabel="Retour à l'accueil"
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

  if (isError || !worker || !data) {
    return (
      <PaymentScreen>
        <PaymentNotice
          title="Paiement indisponible"
          description={
            serverMessage(error) ?? "Impossible de préparer le paiement."
          }
          actionLabel="Retour à l'accueil"
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
        title="Débloquer le contact"
        description={
          <>
            Réglez les frais pour recevoir les coordonnées de{" "}
            <span className="font-medium text-foreground">{workerName}</span> par
            WhatsApp.
          </>
        }
        amount={data.recommendationFee}
        amountLabel="Frais de contact"
        walletBalance={data.walletBalance}
        onPayWallet={handlePayWallet}
        walletPending={payWallet.isPending}
        onPayMobile={handlePayMobile}
        mobilePending={payMobile.isPending}
        onCancel={goBack}
      />
    </PaymentScreen>
  );
}
