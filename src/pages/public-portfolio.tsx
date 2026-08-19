import { useNavigate, useParams, useSearchParams } from "react-router";
import { Loader2, SearchX } from "lucide-react";

import { Seo } from "@/hooks/use-seo";
import { usePublicWorker } from "@/hooks/use-public-worker";
import type { PublicWorkerResponse } from "@/lib/api/public-worker-controller";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import { ScreenHeader } from "@/features/employer";
import { PortfolioHeader } from "@/features/portfolio/components/portfolio-header";
import { PortfolioGrid } from "@/features/portfolio/components/portfolio-grid";

const CONTAINER = "mx-auto w-full max-w-xl px-4 pb-8 sm:pb-12";
const SKELETON_TILE_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];

export default function PublicPortfolio() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Shown only when opened from inside the app (e.g. an employer viewing a
  // candidate) — external/shared links get the clean public page.
  const showBack = searchParams.has("back");
  const {
    data: worker,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = usePublicWorker(slug);

  // Carried into the realization screen so its back button returns here with
  // the in-app header intact.
  const backSuffix = showBack ? "?back=1" : "";

  const header = showBack ? (
    <ScreenHeader title="Profil du candidat" onBack={() => navigate(-1)} />
  ) : null;

  if (isLoading) {
    return (
      <>
        {header}
        <main className={CONTAINER}>
          <Seo title="Portfolio — Rabotka" noIndex />
          <PortfolioSkeleton />
        </main>
      </>
    );
  }

  if (isError || !worker) {
    return (
      <>
        {header}
        <main className={CONTAINER}>
          <Seo title="Portfolio introuvable — Rabotka" noIndex />
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="bg-muted flex size-14 items-center justify-center rounded-full">
            <SearchX className="text-muted-foreground size-7" />
          </div>
          <h1 className="text-foreground text-2xl font-bold">
            Portfolio indisponible
          </h1>
          <p className="text-muted-foreground max-w-md text-sm">
            Ce lien ne correspond à aucun portfolio valide, ou la page n'a pas
            pu être chargée.
          </p>
          <p className="text-muted-foreground max-w-md text-xs">
            Vérifiez le lien reçu et votre connexion internet.
          </p>
          {/* A dropped request lands here too, and this page is often the first
              thing someone sees from a shared link — so offer a retry rather
              than only blaming the link. */}
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            {isFetching && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isFetching ? "Chargement…" : "Réessayer"}
          </Button>
        </div>
        </main>
      </>
    );
  }

  const fullName = `${worker.firstName} ${worker.lastName}`.trim();
  const firstImage = worker.portfolio.flatMap((i) => i.images).at(0)?.imageUrl;

  return (
    <>
      {header}
      <main className={CONTAINER}>
        <Seo
          title={`${fullName} — Réalisations | Rabotka`}
          description={
            worker.description?.slice(0, 160) ||
            `Découvrez les réalisations de ${fullName} sur Rabotka.`
          }
          canonical={`/p/${worker.slug}`}
          ogImage={firstImage ?? worker.avatarUrl ?? undefined}
          ogImageAlt={`Réalisations de ${fullName}`}
          jsonLd={buildJsonLd(worker, fullName)}
        />

      <PortfolioHeader
        profile={{
          fullName,
          avatarUrl: worker.avatarUrl,
          address: worker.address,
          reliabilityScore: worker.reliabilityScore,
          ratingAvg: worker.ratingAvg,
          ratingCount: worker.ratingCount,
          completedMissionsCount: worker.completedMissionsCount,
        }}
        realizationsCount={worker.portfolio.length}
      />

      <Separator className="my-6" />

      {worker.portfolio.length === 0 ? (
        <p className="text-muted-foreground py-10 text-center text-sm">
          Aucune réalisation publiée pour le moment.
        </p>
      ) : (
        <PortfolioGrid
          items={worker.portfolio}
          onOpen={(item) =>
            navigate(`/p/${worker.slug}/r/${item.id}${backSuffix}`, {
              // Lets the detail's back pop instead of pushing the portfolio
              // on top of it — see useBackToPortfolio.
              state: { fromGrid: true },
            })
          }
        />
      )}

      <p className="text-muted-foreground mt-10 text-center text-xs">
        Propulsé par Rabotka
      </p>
      </main>
    </>
  );
}

function PortfolioSkeleton() {
  return (
    // pt-8 mirrors PortfolioHeader's own top padding (the page container no
    // longer supplies it, so the gradient can start flush under the header).
    <div className="pt-8">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="size-24 rounded-full" />
        <Skeleton className="h-5 w-40" />
        <div className="flex items-center gap-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="h-5 w-8" />
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>
        <Skeleton className="h-4 w-full max-w-sm" />
      </div>
      <Separator className="my-6" />
      <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
        {SKELETON_TILE_KEYS.map((key) => (
          <Skeleton key={key} className="aspect-square w-full rounded-none" />
        ))}
      </div>
    </div>
  );
}

function buildJsonLd(worker: PublicWorkerResponse, fullName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: fullName,
      ...(worker.address ? { address: worker.address } : {}),
      ...(worker.avatarUrl ? { image: worker.avatarUrl } : {}),
      ...(worker.description ? { description: worker.description } : {}),
    },
  };
}
