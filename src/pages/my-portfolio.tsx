import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { Plus } from "lucide-react";

import { Seo } from "@/hooks/use-seo";
import { useProfileMe } from "@/hooks/use-profile-me";
import { usePortfolio } from "@/hooks/use-portfolio";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { ScreenHeader } from "@/features/employer";
import { PortfolioHeader } from "@/features/portfolio/components/portfolio-header";
import { PortfolioGrid } from "@/features/portfolio/components/portfolio-grid";
import { RealizationFormSheet } from "@/features/portfolio/components/realization-form-sheet";

const CONTAINER = "mx-auto w-full max-w-xl px-4 pb-10";

export default function MyPortfolio() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfileMe();
  const isWorker = profile?.profileType === "WORKER";
  const { data: items = [], isLoading: itemsLoading } = usePortfolio(isWorker);

  // Only creation lives here now; viewing, editing and deleting an existing
  // realization all happen on its own screen.
  const [createOpen, setCreateOpen] = useState(false);

  if (!profileLoading && profile && !isWorker) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ScreenHeader
        title="Mes réalisations"
        onBack={() => navigate("/profile")}
      />
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
              <Button onClick={() => setCreateOpen(true)} className="w-full">
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
              inspirer confiance aux recruteurs.
            </p>
            <Button onClick={() => setCreateOpen(true)} variant="outline">
              <Plus className="size-4" />
              Ajouter ma première réalisation
            </Button>
          </div>
        ) : (
          <PortfolioGrid
            items={items}
            onOpen={(item) =>
              navigate(`/profile/portfolio/${item.id}`, {
                state: { fromGrid: true },
              })
            }
          />
        )}

        <RealizationFormSheet open={createOpen} onOpenChange={setCreateOpen} />
      </main>
    </div>
  );
}

/** Mirrors PortfolioHeader's centered column so nothing jumps once loaded. */
function HeaderSkeleton() {
  return (
    <div className="flex flex-col items-center space-y-4 pt-8">
      <Skeleton className="size-24 shrink-0 rounded-full" />

      <div className="flex flex-col items-center space-y-1.5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3.5 w-32" />
      </div>

      <div className="flex items-center justify-center gap-10">
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-10 w-16" />
      </div>

      <Skeleton className="h-4 w-full max-w-sm" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
