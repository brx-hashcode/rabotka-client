import { useNavigate } from "react-router";
import { Plus } from "lucide-react";
import { useEmployerJobOffersInfinite } from "@/hooks/use-employer-job-offers-infinite";
import { ScreenHeader, JobOfferList } from "@/features/employer";

export default function Jobs() {
  const navigate = useNavigate();
  const {
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useEmployerJobOffersInfinite();

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
            aria-label="Créer une offre"
            onClick={() => navigate("/job-offers/new")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-whatsapp text-white transition-colors hover:bg-whatsapp-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/40"
          >
            <Plus className="h-5 w-5" />
          </button>
        }
      />
      <JobOfferList
        offers={offers}
        isLoading={isLoading}
        hasMore={hasNextPage}
        isLoadingMore={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
        onOfferClick={(offer) => navigate(`/job-offers/${offer.id}`)}
        emptyMessage="Vous n'avez pas encore publié d'offre. Appuyez sur + pour en créer une."
      />
    </div>
  );
}
