import { useNavigate } from "react-router";
import { useEmployerJobOffersInfinite } from "@/hooks/use-employer-job-offers-infinite";
import {
  ScreenHeader,
  JobOfferList,
  ONGOING_STATUSES,
} from "@/features/employer";

export default function Missions() {
  const navigate = useNavigate();
  const {
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useEmployerJobOffersInfinite(ONGOING_STATUSES);

  const missions = data?.pages.flatMap((p) => p.data) ?? [];
  // `total` is the server-side count of ongoing offers, so it stays correct
  // regardless of how many pages have been loaded.
  const total = data?.pages[0]?.total ?? 0;
  const plural = total > 1 ? "s" : "";
  const subtitle = isLoading ? undefined : `${total} mission${plural} en cours`;

  return (
    <div className="flex min-h-screen flex-col">
      <ScreenHeader title="Missions en cours" subtitle={subtitle} />
      <JobOfferList
        offers={missions}
        isLoading={isLoading}
        hasMore={hasNextPage}
        isLoadingMore={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
        onOfferClick={(offer) => navigate(`/missions/${offer.id}`)}
        emptyMessage="Aucune mission en cours pour le moment. Vos offres pourvues apparaîtront ici."
      />
    </div>
  );
}
