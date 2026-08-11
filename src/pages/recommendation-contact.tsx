import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    <PaymentScreen align="top">
      <PaymentMethodChooser
        // The person, not a generic glyph. This screen asks for money to reach
        // one specific worker, and their face is the most direct confirmation
        // that it is the right one.
        icon={
          <Avatar className="h-16 w-16 rounded-xl">
            <AvatarImage
              src={worker.avatarUrl ?? undefined}
              alt=""
              className="rounded-xl object-cover"
            />
            <AvatarFallback className="rounded-xl bg-whatsapp/10 text-whatsapp">
              <UserRound className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
        }
        title="Débloquer le contact"
        description={
          <>
            <span className="block text-base font-bold text-foreground">
              {workerName}
            </span>
            {worker.categoryName && (
              <span className="block">{worker.categoryName}</span>
            )}
            Ses coordonnées vous seront envoyées par WhatsApp.
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
        note="Remboursé si le contact n'est pas confirmé."
      />
    </PaymentScreen>
  );
}
