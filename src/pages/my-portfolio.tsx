import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import {
  Camera,
  Check,
  ChevronRight,
  Eye,
  ImagePlus,
  MapPin,
  PenLine,
  Plus,
  Share2,
  ShieldCheck,
  Star,
} from "lucide-react";

import { Seo } from "@/hooks/use-seo";
import { useProfileMe } from "@/hooks/use-profile-me";
import { usePortfolio } from "@/hooks/use-portfolio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { ScreenHeader } from "@/features/employer";
import { ShellFooter } from "@/features/navigation";
import { PortfolioFeed } from "@/features/portfolio/components/portfolio-feed";
import { RealizationFormSheet } from "@/features/portfolio/components/realization-form-sheet";
import {
  profileChecklist,
  whatsAppShareLink,
  type ChecklistStep,
} from "@/features/portfolio/profile-checklist";

/**
 * The worker's own publications, laid out for the job it has to do: make the
 * profile convincing to an employer. A compact identity header with the trust
 * signals (rating, reliability), a checklist of what is still missing, the
 * feed, and one way to add — pinned at the bottom, where the two « + »
 * buttons of the old screen became one.
 */
export default function MyPortfolio() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfileMe();
  const isWorker = profile?.profileType === "WORKER";
  const { data: items = [], isLoading: itemsLoading } = usePortfolio(isWorker);
  const [createOpen, setCreateOpen] = useState(false);

  if (!profileLoading && profile && !isWorker) {
    return <Navigate to="/profile" replace />;
  }

  const loading = profileLoading || itemsLoading || !profile;
  const fullName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : "";
  const publicUrl = profile?.portfolioSlug
    ? `${globalThis.location.origin}/p/${profile.portfolioSlug}`
    : null;
  const checklist = profile
    ? profileChecklist(profile, items.length)
    : { steps: [], percent: 0 };

  const openStep = (step: ChecklistStep) => {
    if (step.key === "publications") setCreateOpen(true);
    // Photo, bio and domains are edited in the profile's own sheet.
    else navigate("/profile");
  };

  return (
    <div className="flex min-h-full flex-col">
      <ScreenHeader
        title="Mes publications"
        onBack={() => navigate("/profile")}
        action={
          publicUrl ? (
            // What an employer sees: the public page, from the owner's side.
            <button
              type="button"
              onClick={() => navigate(`/p/${profile?.portfolioSlug}?back=1`)}
              className="flex h-10 items-center gap-1.5 rounded-full bg-card px-3 text-sm font-medium text-foreground shadow-soft active:bg-secondary"
            >
              <Eye className="h-4 w-4" />
              Aperçu
            </button>
          ) : undefined
        }
      />
      <Seo title="Mes publications — Rabotka" noIndex />

      <main className="mx-auto w-full max-w-xl flex-1 space-y-5 px-4 pt-2">
        {loading ? (
          <HeaderSkeleton />
        ) : (
          <>
            {/* Identity, compact and left-aligned: the screen is about the
                work below, not a centred profile card above it. */}
            <section className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                aria-label={
                  profile.avatarUrl ? "Ma photo" : "Ajouter une photo de profil"
                }
                className="relative shrink-0"
              >
                <Avatar className="size-16">
                  {profile.avatarUrl && (
                    <AvatarImage
                      src={profile.avatarUrl}
                      alt={fullName}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="bg-lime text-lg font-semibold text-lime-foreground">
                    {initialsOf(fullName)}
                  </AvatarFallback>
                </Avatar>
                {!profile.avatarUrl && (
                  // The first thing an employer looks at: ask for it here.
                  <span className="absolute -bottom-0.5 -right-0.5 flex size-6 items-center justify-center rounded-full bg-whatsapp text-white ring-2 ring-background">
                    <Camera className="size-3.5" />
                  </span>
                )}
              </button>
              <div className="min-w-0 space-y-1">
                <h1 className="truncate text-lg font-bold text-foreground">
                  {fullName}
                </h1>
                {(profile.city || profile.address) && (
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" />
                    {profile.city || profile.address}
                  </p>
                )}
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {(profile.ratingCount ?? 0) > 0 && profile.ratingAvg != null ? (
                    <span className="inline-flex items-center gap-1 font-medium text-foreground">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      {profile.ratingAvg.toFixed(1)}
                      <span className="font-normal text-muted-foreground">
                        ({profile.ratingCount} avis)
                      </span>
                    </span>
                  ) : (
                    <span>Pas encore d'avis</span>
                  )}
                  {profile.reliabilityScore != null && (
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="size-3.5 text-whatsapp" />
                      {profile.reliabilityScore} % fiable
                    </span>
                  )}
                </p>
              </div>
            </section>

            {checklist.percent < 100 && (
              <section className="rounded-xl bg-card p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    Complétez votre profil
                  </p>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-whatsapp">
                    {checklist.percent} %
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Un profil complet a plus de chances d'être choisi.
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-whatsapp transition-all duration-500 motion-reduce:transition-none"
                    style={{ width: `${checklist.percent}%` }}
                  />
                </div>
                <ul className="mt-3 space-y-0.5">
                  {checklist.steps.map((step) => (
                    <li key={step.key}>
                      <button
                        type="button"
                        disabled={step.done}
                        onClick={() => openStep(step)}
                        className="flex w-full items-center gap-3 rounded-lg px-1 py-2 text-left text-sm active:bg-secondary disabled:active:bg-transparent"
                      >
                        <span
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-full",
                            step.done
                              ? "bg-whatsapp text-white"
                              : "ring-1 ring-inset ring-border",
                          )}
                        >
                          {step.done && <Check className="size-3" strokeWidth={3} />}
                        </span>
                        <span
                          className={cn(
                            "flex-1",
                            step.done
                              ? "text-muted-foreground line-through"
                              : "text-foreground",
                          )}
                        >
                          {step.label}
                        </span>
                        {!step.done && (
                          <ChevronRight className="size-4 text-muted-foreground" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">
                  Publications
                  <span className="ml-1.5 font-normal text-muted-foreground">
                    {items.length}
                  </span>
                </h2>
                {publicUrl && items.length > 0 && (
                  <a
                    href={whatsAppShareLink(fullName, publicUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-whatsapp"
                  >
                    <Share2 className="size-4" />
                    Partager
                  </a>
                )}
              </div>

              {items.length === 0 ? (
                <EmptyPortfolio />
              ) : (
                <PortfolioFeed
                  items={items}
                  onOpen={(item) =>
                    navigate(`/profile/portfolio/${item.id}`, {
                      state: { fromGrid: true },
                    })
                  }
                />
              )}
            </section>
          </>
        )}
      </main>

      {/* The one way to add, always in reach: in the shell's footer slot,
          so it stays put on top of the tab bar while the page scrolls. */}
      <ShellFooter>
        <div className="bg-background px-4 pb-3 pt-3">
          <Button
            className="mx-auto flex h-12 w-full max-w-xl bg-whatsapp text-base text-white hover:bg-whatsapp-dark"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-5" />
            {items.length === 0
              ? "Ajouter ma première publication"
              : "Nouvelle publication"}
          </Button>
        </div>
      </ShellFooter>

      <RealizationFormSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

/**
 * What to post, shown rather than told: a faded sample card and three tips,
 * instead of a sentence alone in the middle of the screen.
 */
function EmptyPortfolio() {
  const tips = [
    { icon: ImagePlus, text: "Une photo avant, une photo après le travail" },
    { icon: PenLine, text: "En une phrase : ce que vous avez fait, et où" },
    { icon: Star, text: "Vos meilleurs travaux d'abord" },
  ];
  return (
    <div className="space-y-4">
      <div
        aria-hidden
        className="relative overflow-hidden rounded-xl bg-card opacity-70"
      >
        <span className="absolute left-3 top-3 z-10 rounded-full bg-foreground/80 px-2 py-0.5 text-[11px] font-medium text-background">
          Exemple
        </span>
        <div className="grid grid-cols-2 gap-0.5">
          <div className="flex aspect-square items-end bg-gradient-to-br from-stone-300 to-stone-400 p-2">
            <span className="rounded bg-black/40 px-1.5 py-0.5 text-[11px] text-white">
              Avant
            </span>
          </div>
          <div className="flex aspect-square items-end bg-gradient-to-br from-lime to-whatsapp/60 p-2">
            <span className="rounded bg-black/40 px-1.5 py-0.5 text-[11px] text-white">
              Après
            </span>
          </div>
        </div>
        <p className="px-4 py-3 text-sm text-foreground">
          Peinture complète d'un salon à Moungali, en deux jours.
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          Montrez votre travail : les employeurs choisissent sur photos.
        </p>
        <ul className="space-y-2 pt-1">
          {tips.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-lime text-lime-foreground">
                <Icon className="size-3.5" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function initialsOf(fullName: string): string {
  return (
    fullName
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

/** Mirrors the compact header so nothing jumps once loaded. */
function HeaderSkeleton() {
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
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}
