import { useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import { ImageOff, Pencil, Trash2 } from "lucide-react";

import { Seo } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicWorker } from "@/hooks/use-public-worker";
import { useProfileMe } from "@/hooks/use-profile-me";
import { usePortfolio, useDeletePortfolioItem } from "@/hooks/use-portfolio";

import { ScreenHeader } from "@/features/employer";
import { RealizationView } from "@/features/portfolio/components/realization-view";
import { RealizationFormSheet } from "@/features/portfolio/components/realization-form-sheet";
import { ConfirmDialog } from "@/features/portfolio/components/confirm-dialog";

/**
 * One realization, on its own screen.
 *
 * Two routes share this file — `/p/:slug/r/:itemId` for a public portfolio and
 * `/profile/portfolio/:itemId` for the owner's — because the presentation is
 * identical and only the data source and the available actions differ. The
 * branch is on `slug`, so each variant calls its own hooks unconditionally.
 */
/**
 * Back behaviour.
 *
 * Navigating to an explicit path PUSHES, so a path-based back button left the
 * portfolio sitting on top of the realization in history: the portfolio's own
 * back then went *forward* into the realization again, trapping the user in a
 * loop. When we know the grid pushed us here, pop instead — that unwinds the
 * stack properly and restores the grid's scroll position. The explicit path
 * stays as the fallback for a deep link, where there is nothing to pop to.
 */
function useBackToPortfolio(portfolioPath: string) {
  const navigate = useNavigate();
  const location = useLocation();
  const cameFromGrid = Boolean(
    (location.state as { fromGrid?: boolean } | null)?.fromGrid,
  );
  return () => {
    if (cameFromGrid) navigate(-1);
    else navigate(portfolioPath);
  };
}

export default function RealizationDetail() {
  const { slug, itemId = "" } = useParams<{ slug?: string; itemId: string }>();

  return slug ? (
    <PublicRealization slug={slug} itemId={itemId} />
  ) : (
    <OwnRealization itemId={itemId} />
  );
}

function PublicRealization({
  slug,
  itemId,
}: Readonly<{ slug: string; itemId: string }>) {
  const [searchParams] = useSearchParams();
  const { data: worker, isLoading, isError } = usePublicWorker(slug);

  // Preserved so returning to the portfolio keeps its in-app header, rather
  // than dropping the employer onto the bare public page.
  const backSuffix = searchParams.has("back") ? "?back=1" : "";
  const goToPortfolio = useBackToPortfolio(`/p/${slug}${backSuffix}`);

  const item = worker?.portfolio.find((i) => i.id === itemId) ?? null;
  const fullName = worker
    ? `${worker.firstName} ${worker.lastName}`.trim()
    : "";

  if (isLoading) return <DetailSkeleton onBack={goToPortfolio} />;

  if (isError || !worker || !item) {
    return <NotFound onBack={goToPortfolio} />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Seo title={`${item.title} — ${fullName} | Rabotka`} noIndex />
      <ScreenHeader title="Réalisation" onBack={goToPortfolio} />
      <RealizationView
        item={item}
        author={{ fullName, avatarUrl: worker.avatarUrl }}
        onAuthorClick={goToPortfolio}
      />
    </div>
  );
}

function OwnRealization({ itemId }: Readonly<{ itemId: string }>) {
  const navigate = useNavigate();
  const { data: profile } = useProfileMe();
  const isWorker = profile?.profileType === "WORKER";
  const { data: items = [], isLoading } = usePortfolio(isWorker);
  const deleteMutation = useDeletePortfolioItem();

  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const goToPortfolio = useBackToPortfolio("/profile/portfolio");

  // Read from the list on every render rather than held in state, so an edit
  // is reflected here as soon as the mutation refreshes the cache.
  const item = items.find((i) => i.id === itemId) ?? null;

  if (isLoading) return <DetailSkeleton onBack={goToPortfolio} />;
  if (!item) return <NotFound onBack={goToPortfolio} />;

  return (
    <div className="flex min-h-screen flex-col">
      <Seo title={`${item.title} — Rabotka`} noIndex />
      <ScreenHeader title="Réalisation" onBack={goToPortfolio} />

      <RealizationView
        item={item}
        actions={
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="size-4" />
              Modifier
            </Button>
            <Button
              variant="destructive-soft"
              className="flex-1"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="size-4" />
              Supprimer
            </Button>
          </div>
        }
      />

      <RealizationFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        item={item}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Supprimer la réalisation"
        description="Cette réalisation et toutes ses images seront définitivement supprimées."
        actionLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onConfirm={() =>
          deleteMutation.mutate(item.id, {
            // The screen's own subject is gone, so there is nothing to return to.
            onSuccess: goToPortfolio,
          })
        }
      />
    </div>
  );
}

function NotFound({ onBack }: Readonly<{ onBack: () => void }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <ScreenHeader title="Réalisation" onBack={onBack} />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
        <div className="bg-muted flex size-14 items-center justify-center rounded-full">
          <ImageOff className="text-muted-foreground size-7" />
        </div>
        <p className="text-muted-foreground max-w-xs text-sm">
          Cette réalisation n'existe plus ou n'est pas disponible.
        </p>
        <Button variant="outline" onClick={onBack}>
          Retour aux réalisations
        </Button>
      </div>
    </div>
  );
}

function DetailSkeleton({ onBack }: Readonly<{ onBack: () => void }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <ScreenHeader title="Réalisation" onBack={onBack} />
      <div className="mx-auto w-full max-w-xl">
        <div className="flex items-center gap-3 px-4 pb-3">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="aspect-square w-full rounded-none" />
        <div className="space-y-2 px-4 pt-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  );
}
