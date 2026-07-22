import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  BadgeCheck,
  ImageOff,
  MapPin,
  SearchX,
  ShieldCheck,
  Star,
} from "lucide-react";

import { Seo } from "@/hooks/use-seo";
import { usePublicWorker } from "@/hooks/use-public-worker";
import type {
  PublicPortfolioItem,
  PublicWorkerResponse,
} from "@/lib/api/public-worker-controller";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

const CONTAINER =
  "mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8";

export default function PublicPortfolio() {
  const { slug } = useParams<{ slug: string }>();
  const { data: worker, isLoading, isError } = usePublicWorker(slug);
  const [lightbox, setLightbox] = useState<string | null>(null);

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
  const firstImage = worker.portfolio
    .flatMap((item) => item.images)
    .at(0)?.imageUrl;

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

      <WorkerHeader worker={worker} fullName={fullName} />

      <section className="mt-10">
        <h2 className="text-foreground mb-4 text-lg font-semibold">
          Réalisations
        </h2>
        {worker.portfolio.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Aucune réalisation publiée pour le moment.
          </p>
        ) : (
          <div className="space-y-6">
            {worker.portfolio.map((item) => (
              <RealizationCard
                key={item.id}
                item={item}
                onOpen={setLightbox}
              />
            ))}
          </div>
        )}
      </section>

      <CtaCard />

      <Dialog
        open={lightbox !== null}
        onOpenChange={(open) => {
          if (!open) setLightbox(null);
        }}
      >
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          <DialogTitle className="sr-only">Aperçu de la réalisation</DialogTitle>
          {lightbox && (
            <img
              src={lightbox}
              alt="Réalisation"
              className="max-h-[80vh] w-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

function WorkerHeader({
  worker,
  fullName,
}: Readonly<{ worker: PublicWorkerResponse; fullName: string }>) {
  const initials =
    `${worker.firstName.charAt(0)}${worker.lastName.charAt(0)}`.toUpperCase();

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
        <Avatar className="size-20 shrink-0">
          {worker.avatarUrl && (
            <AvatarImage src={worker.avatarUrl} alt={fullName} />
          )}
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h1 className="text-foreground text-2xl font-bold">{fullName}</h1>
          {worker.address && (
            <p className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
              <MapPin className="size-4 shrink-0" />
              {worker.address}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {worker.reliabilityScore != null && (
              <Badge variant="secondary" className="gap-1">
                <ShieldCheck className="size-3.5" />
                Fiabilité {worker.reliabilityScore}/100
              </Badge>
            )}
            {worker.ratingCount > 0 && worker.ratingAvg != null && (
              <Badge variant="secondary" className="gap-1">
                <Star className="size-3.5 fill-current" />
                {worker.ratingAvg.toFixed(1)} ({worker.ratingCount})
              </Badge>
            )}
            <Badge variant="secondary" className="gap-1">
              <BadgeCheck className="size-3.5" />
              {worker.completedMissionsCount} mission
              {worker.completedMissionsCount === 1 ? "" : "s"} complétée
              {worker.completedMissionsCount === 1 ? "" : "s"}
            </Badge>
          </div>

          {worker.description && (
            <p className="text-foreground/80 mt-4 text-sm whitespace-pre-line">
              {worker.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RealizationCard({
  item,
  onOpen,
}: Readonly<{ item: PublicPortfolioItem; onOpen: (url: string) => void }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{item.title}</CardTitle>
        {item.description && (
          <p className="text-muted-foreground text-sm whitespace-pre-line">
            {item.description}
          </p>
        )}
      </CardHeader>
      {item.images.length > 0 && (
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {item.images.map((img, index) => (
              <GalleryImage
                key={img.id}
                url={img.imageUrl}
                index={index}
                onOpen={onOpen}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function GalleryImage({
  url,
  index,
  onOpen,
}: Readonly<{ url: string; index: number; onOpen: (url: string) => void }>) {
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);

  return (
    <AspectRatio
      ratio={4 / 3}
      className="bg-muted overflow-hidden rounded-lg"
    >
      {broken ? (
        <div className="text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-1">
          <ImageOff className="size-5" />
          <span className="text-[10px]">Indisponible</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onOpen(url)}
          className="h-full w-full cursor-pointer"
          aria-label={`Agrandir la réalisation ${index + 1}`}
        >
          {!loaded && <Skeleton className="absolute inset-0 h-full w-full" />}
          <img
            src={url}
            alt={`Réalisation ${index + 1}`}
            loading="lazy"
            className="h-full w-full object-cover"
            onLoad={() => setLoaded(true)}
            onError={() => setBroken(true)}
          />
        </button>
      )}
    </AspectRatio>
  );
}

function CtaCard() {
  return (
    <Card className="mt-10 border-primary/20 bg-primary/5">
      <CardContent className="flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-foreground font-semibold">
            Vous cherchez un professionnel fiable ?
          </p>
          <p className="text-muted-foreground text-sm">
            Trouvez et contactez des travailleurs de confiance sur Rabotka.
          </p>
        </div>
        <Button variant="whatsapp" asChild className="shrink-0">
          <Link to="/">Découvrir Rabotka</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function PortfolioSkeleton() {
  return (
    <div className="space-y-10">
      <Card>
        <CardContent className="flex gap-4 p-6">
          <Skeleton className="size-20 shrink-0 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        </CardContent>
      </Card>
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="aspect-[4/3] w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
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
