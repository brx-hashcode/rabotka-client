import { useState } from "react";
import { useParams } from "react-router";
import { SearchX } from "lucide-react";

import { Seo } from "@/hooks/use-seo";
import { usePublicWorker } from "@/hooks/use-public-worker";
import type { PublicWorkerResponse } from "@/lib/api/public-worker-controller";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import { PortfolioHeader } from "@/features/portfolio/components/portfolio-header";
import { PortfolioGrid } from "@/features/portfolio/components/portfolio-grid";
import { RealizationViewer } from "@/features/portfolio/components/realization-viewer";
import type { PortfolioItem } from "@/features/portfolio/types";

const CONTAINER = "mx-auto w-full max-w-xl px-4 py-8 sm:py-12";
const SKELETON_TILE_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];

export default function PublicPortfolio() {
  const { slug } = useParams<{ slug: string }>();
  const { data: worker, isLoading, isError } = usePublicWorker(slug);
  const [selected, setSelected] = useState<PortfolioItem | null>(null);

  if (isLoading) {
    return (
      <main className={CONTAINER}>
        <Seo title="Portfolio — Rabotka" noIndex />
        <PortfolioSkeleton />
      </main>
    );
  }

  if (isError || !worker) {
    return (
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
            Ce lien ne correspond à aucun portfolio valide. Il est peut-être
            incorrect, ou ce travailleur n'a pas encore publié de réalisations.
          </p>
          <p className="text-muted-foreground max-w-md text-xs">
            Vérifiez le lien reçu et réessayez.
          </p>
        </div>
      </main>
    );
  }

  const fullName = `${worker.firstName} ${worker.lastName}`.trim();
  const firstImage = worker.portfolio.flatMap((i) => i.images).at(0)?.imageUrl;

  return (
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
          description: worker.description,
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
        <PortfolioGrid items={worker.portfolio} onOpen={setSelected} />
      )}

      <p className="text-muted-foreground mt-10 text-center text-xs">
        Propulsé par Rabotka
      </p>

      <RealizationViewer
        item={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </main>
  );
}

function PortfolioSkeleton() {
  return (
    <div>
      <div className="flex items-center gap-5 sm:gap-8">
        <Skeleton className="size-20 shrink-0 rounded-full sm:size-24" />
        <div className="flex flex-1 items-center justify-around">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="h-5 w-8" />
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-full max-w-sm" />
        <Skeleton className="h-3 w-32" />
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
