import { useState } from "react";
import { useNavigate } from "react-router";
import { FileWarning } from "lucide-react";
import {
  PaymentScreen,
  PaymentScreenSkeleton,
  PaymentMethodChooser,
  PaymentSuccess,
  PaymentNotice,
} from "@/features/payments";
import { QueryErrorState } from "@/components/common/query-error-state";
import { isNetworkError, serverMessage } from "@/lib/api/errors";
import {
  usePenaltiesDue,
  usePayPenaltiesWallet,
  usePayPenaltiesMobile,
} from "@/hooks/use-pay-penalties";

const BACK_TO = "/profile";

export default function PenaltiesPayment() {
  const navigate = useNavigate();
  const {
    data: due,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = usePenaltiesDue();
  const payWallet = usePayPenaltiesWallet();
  const payMobile = usePayPenaltiesMobile();

  const [paid, setPaid] = useState(false);
  const goBack = () => navigate(BACK_TO);

  const handlePayWallet = () =>
    payWallet.mutate(undefined, { onSuccess: () => setPaid(true) });

  const handlePayMobile = () =>
    payMobile.mutate(undefined, {
      onSuccess: ({ token }) =>
        navigate(`/pay/${token}?return=${encodeURIComponent(BACK_TO)}`),
    });

  if (paid) {
    return (
      <PaymentScreen>
        <PaymentSuccess
          title="Pénalités réglées !"
          description="Votre compte est à jour. Vous pouvez postuler à nouveau."
          actionLabel="Retour au profil"
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
          message="Impossible de charger vos pénalités."
          onRetry={refetch}
          isRetrying={isFetching}
        />
      </PaymentScreen>
    );
  }

  if (isError || !due) {
    return (
      <PaymentScreen>
        <PaymentNotice
          title="Paiement indisponible"
          description={
            serverMessage(error) ??
            "Impossible de préparer le paiement de vos pénalités."
          }
          actionLabel="Retour au profil"
          onAction={goBack}
        />
      </PaymentScreen>
    );
  }

  if (due.count === 0) {
    return (
      <PaymentScreen>
        <PaymentNotice
          title="Aucune pénalité"
          description="Vous n'avez aucune pénalité impayée."
          actionLabel="Retour au profil"
          onAction={goBack}
        />
      </PaymentScreen>
    );
  }

  const plural = due.count > 1 ? "s" : "";

  return (
    <PaymentScreen>
      <PaymentMethodChooser
        icon={
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <FileWarning className="h-6 w-6 text-destructive" />
          </div>
        }
        title="Régler mes pénalités"
        description={`${due.count} pénalité${plural} impayée${plural} — réglez-les pour postuler à nouveau.`}
        amount={due.totalAmount}
        walletBalance={due.walletBalance}
        onPayWallet={handlePayWallet}
        walletPending={payWallet.isPending}
        onPayMobile={handlePayMobile}
        mobilePending={payMobile.isPending}
        onCancel={goBack}
      />
    </PaymentScreen>
  );
}
