import { useNavigate, useParams, useSearchParams } from "react-router";
import { Loader2, SearchX } from "lucide-react";

import { Seo } from "@/hooks/use-seo";
import { usePublicWorker } from "@/hooks/use-public-worker";
import type { PublicWorkerResponse } from "@/lib/api/public-worker-controller";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { ScreenHeader } from "@/features/employer";
import { ProfileIdentity } from "@/features/portfolio/components/profile-identity";
import { PortfolioFeed } from "@/features/portfolio/components/portfolio-feed";

const CONTAINER = "mx-auto w-full max-w-xl space-y-5 px-4 pb-8 pt-4 sm:pb-12";
const SKELETON_TILE_KEYS = ["a", "b", "c", "d"];

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
          <Seo title="Publications — Rabotka" noIndex />
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
          <Seo title="Publications introuvables — Rabotka" noIndex />
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="bg-muted flex size-14 items-center justify-center rounded-full">
            <SearchX className="text-muted-foreground size-7" />
          </div>
          <h1 className="text-foreground text-2xl font-bold">
            Publications indisponibles
          </h1>
          <p className="text-muted-foreground max-w-md text-sm">
            Ce lien ne correspond à aucun profil valide, ou la page n'a pas
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
          title={`${fullName} — Publications | Rabotka`}
          description={
            worker.description?.slice(0, 160) ||
            `Découvrez les publications de ${fullName} sur Rabotka.`
          }
          canonical={`/p/${worker.slug}`}
          ogImage={firstImage ?? worker.avatarUrl ?? undefined}
          ogImageAlt={`Publications de ${fullName}`}
          jsonLd={buildJsonLd(worker, fullName)}
        />

      {/* Same compact identity as « Mes publications »: the worker sees
          their page exactly as an employer does. */}
      <ProfileIdentity
        fullName={fullName}
        avatarUrl={worker.avatarUrl}
        location={worker.location}
        ratingAvg={worker.ratingAvg}
        ratingCount={worker.ratingCount}
        reliabilityScore={worker.reliabilityScore}
        completedMissions={worker.completedMissionsCount}
      />

      {/* No « À propos » here: the bio is on the worker's profile screen,
          which is where an employer arrives from. It still feeds the SEO
          description and the JSON-LD above. */}

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Publications
          <span className="ml-1.5 font-normal text-muted-foreground">
            {worker.portfolio.length}
          </span>
        </h2>
        {worker.portfolio.length === 0 ? (
          <p className="rounded-xl bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            Aucune publication pour le moment.
          </p>
        ) : (
          <PortfolioFeed
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
      </section>
      </main>
    </>
  );
}

/** Mirrors the compact identity and the two-column grid. */
function PortfolioSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 shrink-0 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3.5 w-36" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {SKELETON_TILE_KEYS.map((key) => (
          <Skeleton key={key} className="aspect-[4/5] w-full rounded-xl" />
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
      // The locality only — never a street address, on an indexed page.
      ...(worker.location
        ? {
            address: {
              "@type": "PostalAddress",
              addressLocality: worker.location,
            },
          }
        : {}),
      ...(worker.avatarUrl ? { image: worker.avatarUrl } : {}),
      ...(worker.description ? { description: worker.description } : {}),
    },
  };
}
