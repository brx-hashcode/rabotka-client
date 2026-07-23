import { useState } from "react";
import { Navigate } from "react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Seo } from "@/hooks/use-seo";
import { useProfileMe } from "@/hooks/use-profile-me";
import {
  usePortfolio,
  useDeletePortfolioItem,
} from "@/hooks/use-portfolio";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { PortfolioHeader } from "@/features/portfolio/components/portfolio-header";
import { PortfolioGrid } from "@/features/portfolio/components/portfolio-grid";
import { RealizationViewer } from "@/features/portfolio/components/realization-viewer";
import { RealizationFormSheet } from "@/features/portfolio/components/realization-form-sheet";
import { ConfirmDialog } from "@/features/portfolio/components/confirm-dialog";
import type { PortfolioItem } from "@/features/portfolio/types";

const CONTAINER = "mx-auto w-full max-w-xl px-4 pt-8 pb-10 sm:pt-10";

export default function MyPortfolio() {
  const { data: profile, isLoading: profileLoading } = useProfileMe();
  const isWorker = profile?.profileType === "WORKER";
  const { data: items = [], isLoading: itemsLoading } = usePortfolio(isWorker);
  const deleteMutation = useDeletePortfolioItem();

  const [viewing, setViewing] = useState<PortfolioItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<PortfolioItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PortfolioItem | null>(null);

  if (!profileLoading && profile && !isWorker) {
    return <Navigate to="/profile" replace />;
  }

  // Keep the viewer/edit sheet in sync with the latest server data.
  const liveViewing = viewing
    ? (items.find((i) => i.id === viewing.id) ?? null)
    : null;
  const liveEditItem = editItem
    ? (items.find((i) => i.id === editItem.id) ?? null)
    : null;

  const openCreate = () => {
    setEditItem(null);
    setFormOpen(true);
  };
  const openEdit = (item: PortfolioItem) => {
    setViewing(null);
    setEditItem(item);
    setFormOpen(true);
  };

  return (
    <main className={CONTAINER}>
      <Seo title="Mes réalisations — Rabotka" noIndex />

      {profileLoading || itemsLoading || !profile ? (
        <HeaderSkeleton />
      ) : (
        <PortfolioHeader
          profile={{
            fullName: `${profile.firstName} ${profile.lastName}`.trim(),
            avatarUrl: profile.avatarUrl,
            address: profile.address,
            description: profile.description,
            reliabilityScore: profile.reliabilityScore,
            ratingAvg: null,
            ratingCount: 0,
            completedMissionsCount: null,
          }}
          realizationsCount={items.length}
          action={
            <Button onClick={openCreate} className="w-full">
              <Plus className="size-4" />
              Ajouter une réalisation
            </Button>
          }
        />
      )}

      <Separator className="my-6" />

      {!itemsLoading && items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-muted-foreground text-sm">
            Vous n'avez pas encore de réalisation. Montrez votre travail pour
            inspirer confiance aux employeurs.
          </p>
          <Button onClick={openCreate} variant="outline">
            <Plus className="size-4" />
            Ajouter ma première réalisation
          </Button>
        </div>
      ) : (
        <PortfolioGrid items={items} onOpen={setViewing} />
      )}

      <RealizationViewer
        item={liveViewing}
        open={liveViewing !== null}
        onOpenChange={(open) => {
          if (!open) setViewing(null);
        }}
        actions={
          liveViewing && (
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => openEdit(liveViewing)}
              >
                <Pencil className="size-4" />
                Modifier
              </Button>
              <Button
                variant="outline"
                className="border-destructive/40 text-destructive hover:border-destructive hover:bg-destructive/10 hover:text-destructive flex-1"
                onClick={() => {
                  setDeleteTarget(liveViewing);
                  setViewing(null);
                }}
              >
                <Trash2 className="size-4" />
                Supprimer
              </Button>
            </div>
          )
        }
      />

      <RealizationFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        item={liveEditItem}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Supprimer la réalisation"
        description="Cette réalisation et toutes ses images seront définitivement supprimées."
        actionLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            });
          }
        }}
      />
    </main>
  );
}

function HeaderSkeleton() {
  return (
    <div>
      <div className="flex items-center gap-5 sm:gap-8">
        <Skeleton className="size-20 shrink-0 rounded-full sm:size-24" />
        <div className="flex flex-1 items-center justify-around">
          <Skeleton className="h-10 w-14" />
          <Skeleton className="h-10 w-14" />
        </div>
      </div>
      <Skeleton className="mt-4 h-4 w-40" />
      <Skeleton className="mt-2 h-4 w-full max-w-sm" />
    </div>
  );
}
