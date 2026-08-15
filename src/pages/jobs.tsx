import { useNavigate } from "react-router";
import { Plus } from "lucide-react";
import { useEmployerJobOffersInfinite } from "@/hooks/use-employer-job-offers-infinite";
import { ScreenHeader, JobOfferList } from "@/features/employer";
import { useAccountGate } from "@/hooks/use-account-gate";
import { AccountNotice } from "@/features/account";
import { useKycGate } from "@/hooks/use-kyc-gate";
import { KycNotice } from "@/features/kyc";
import { cn } from "@/lib/utils";

export default function Jobs() {
  const navigate = useNavigate();
  const {
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useEmployerJobOffersInfinite();
  // Publishing needs an ACTIVE account and a cleared identity — the same two
  // gates /job-offers/new resolves before it will render the form. Without them
  // here the + stayed live and led to a screen that only says no.
  const { blocked: accountBlocked, reason: accountReason } = useAccountGate();
  const { blocked: kycBlocked, reason: kycReason } = useKycGate();
  const cannotCreate = accountBlocked || kycBlocked;

  const offers = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const plural = total > 1 ? "s" : "";
  const subtitle = isLoading ? undefined : `${total} offre${plural}`;

  return (
    <div className="flex min-h-screen flex-col">
      <ScreenHeader
        title="Mes offres"
        subtitle={subtitle}
        action={
          <button
            type="button"
            aria-label={
              cannotCreate
                ? "Création d'offre indisponible"
                : "Créer une offre"
            }
            disabled={cannotCreate}
            onClick={() => navigate("/job-offers/new")}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/40",
              cannotCreate
                ? "bg-muted text-muted-foreground"
                : "bg-whatsapp text-white hover:bg-whatsapp-dark",
            )}
          >
            <Plus className="h-5 w-5" />
          </button>
        }
      />

      {/* The reason the + is dead. A disabled button explains nothing on touch —
          there is no hover to carry a tooltip — so the notice does it, in the
          same place and precedence as everywhere else: account outranks KYC. */}
      {cannotCreate && (
        <div className="px-4 pt-4">
          {accountBlocked && accountReason ? (
            <AccountNotice reason={accountReason} />
          ) : (
            kycReason && <KycNotice reason={kycReason} />
          )}
        </div>
      )}

      <JobOfferList
        offers={offers}
        isLoading={isLoading}
        hasMore={hasNextPage}
        isLoadingMore={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
        onOfferClick={(offer) => navigate(`/job-offers/${offer.id}`)}
        emptyMessage={
          cannotCreate
            ? "Vous n'avez pas encore publié d'offre. La création est indisponible tant que votre compte n'est pas en règle."
            : "Vous n'avez pas encore publié d'offre. Appuyez sur + pour en créer une."
        }
      />
    </div>
  );
}
