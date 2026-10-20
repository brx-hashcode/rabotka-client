import { useState } from "react";
import { useNavigate } from "react-router";
import {
  AlertCircle,
  ChevronRight,
  Clock,
  Images,
  LayoutDashboard,
  UserRound,
  UsersRound,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileMe } from "@/hooks/use-profile-me";
import { usePortfolio } from "@/hooks/use-portfolio";
import { PenaltiesSheetButton } from "@/features/profile/components/penalties-sheet-button";
import { EditProfileSheetButton } from "@/features/profile/components/edit-profile-sheet-button";
import { InvoicesSheetButton } from "@/features/profile/components/invoices-sheet-button";
import { ReferralSheetButton } from "@/features/profile/components/referral-sheet-button";
import { ProfileIdentity } from "@/features/portfolio/components/profile-identity";
import {
  profileChecklist,
  type ChecklistStep,
} from "@/features/portfolio/profile-checklist";
import { SupportContactButton } from "@/features/support";
import type { ProfileMeResponse } from "@/lib/api/profile-controller";
import { cn, formatAmount } from "@/lib/utils";

/**
 * The profile tab, as a hub: who you are in one compact card, the three
 * numbers that matter (each one a way in), what is missing from the profile,
 * then everything reachable from here, grouped.
 *
 * It used to open on a centred header taking a third of the screen, then the
 * bio, the domains and every contact field — so the links people came for
 * (publications, wallet, claims) sat at the bottom, under a floating pencil
 * that covered the content. The facts now live on « Mes informations ».
 */
export default function Profile() {
  const navigate = useNavigate();
  const { data: profile, isLoading, error } = useProfileMe();
  const isWorker = profile?.profileType === "WORKER";
  const { data: publications = [] } = usePortfolio(isWorker);
  // Bumped to open the edit sheet from the avatar or a checklist step.
  const [editSignal, setEditSignal] = useState(0);

  if (isLoading) {
    return (
      <div className="px-4 pb-8 pt-6">
        <ProfileSkeleton />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center px-4 pb-8 pt-10">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-foreground">Erreur</h1>
          <p className="text-muted-foreground">
            Impossible de charger votre profil. Veuillez vous reconnecter.
          </p>
        </div>
      </div>
    );
  }

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const isEmployer = profile.profileType === "EMPLOYER";
  const checklist = isWorker
    ? profileChecklist(profile, publications.length)
    : null;
  const openEdit = () => setEditSignal((n) => n + 1);
  const openStep = (step: ChecklistStep) =>
    step.key === "publications" ? navigate("/profile/portfolio") : openEdit();

  return (
    <div className="space-y-6 px-4 pb-8 pt-6">
      <ProfileIdentity
        fullName={fullName}
        avatarUrl={profile.avatarUrl}
        location={profile.city || profile.address || null}
        ratingAvg={profile.ratingAvg ?? null}
        ratingCount={profile.ratingCount ?? 0}
        reliabilityScore={profile.reliabilityScore}
        verified={profile.verificationStatus === "VERIFIED"}
        onAvatarClick={openEdit}
        action={
          <EditProfileSheetButton profile={profile} inline openSignal={editSignal} />
        }
        footer={
          // Only when it needs saying: « Actif » is the normal case.
          profile.status === "ACTIVE" ? null : (
            <AccountStatusBadge status={profile.status} />
          )
        }
      />

      {/* The three numbers, each a way into what it counts. */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatTile
          // The amount says what it is; « Recharger » is the second line.
          value={formatAmount(profile.walletBalance)}
          ariaLabel={`Solde : ${formatAmount(profile.walletBalance)}. Recharger`}
          hint="Recharger"
          onClick={() => navigate("/portefeuille")}
        />
        {isEmployer ? (
          <StatTile
            value={String(profile.jobOffersCount)}
            label="Offres publiées"
            onClick={() => navigate("/jobs")}
          />
        ) : (
          <StatTile
            value={String(profile.applicationsCount)}
            label="Candidatures"
            onClick={() => navigate("/mes-candidatures")}
          />
        )}
        <StatTile
          value={
            profile.reliabilityScore == null ? "—" : `${profile.reliabilityScore} %`
          }
          label="Fiabilité"
        />
      </div>

      {checklist && checklist.percent < 100 && (
        <section className="rounded-xl bg-card p-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">
              Complétez votre profil
            </p>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-whatsapp">
              {checklist.percent} %
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-whatsapp transition-all duration-500 motion-reduce:transition-none"
              style={{ width: `${checklist.percent}%` }}
            />
          </div>
          {/* Only what is left: the done steps are the bar's job here. */}
          <ul className="mt-2">
            {checklist.steps
              .filter((s) => !s.done)
              .map((step) => (
                <li key={step.key}>
                  <button
                    type="button"
                    onClick={() => openStep(step)}
                    className="flex w-full items-center gap-3 rounded-lg px-1 py-2 text-left text-sm text-foreground active:bg-secondary"
                  >
                    <span className="size-5 shrink-0 rounded-full ring-1 ring-inset ring-border" />
                    <span className="flex-1">{step.label}</span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </button>
                </li>
              ))}
          </ul>
        </section>
      )}

      <Group title="Mon activité">
        {isWorker && (
          <Row
            icon={Images}
            label="Mes publications"
            detail={String(publications.length)}
            onClick={() => navigate("/profile/portfolio")}
          />
        )}
        {isEmployer && (
          <>
            <Row
              icon={LayoutDashboard}
              label="Tableau de bord"
              onClick={() => navigate("/dashboard")}
            />
            {/* Missions gave its tab slot to Discussion; it lives here. */}
            <Row
              icon={Clock}
              label="Missions"
              onClick={() => navigate("/missions")}
            />
            {/* Hidden, not removed: the page, its route and the API still
                work — restoring it is deleting this wrapper. */}
            <div className="hidden">
              <Row
                icon={UsersRound}
                label="Profils contactés"
                onClick={() => navigate("/profils-contactes")}
              />
            </div>
          </>
        )}
        {/* Both roles: the worker's tab bar gave Réclamations up to
            Discussion on the promise that it lived here — and it did not. */}
        <Row
          icon={AlertCircle}
          label="Réclamations"
          onClick={() => navigate("/claims")}
        />
        {isWorker && <PenaltiesSheetButton asRow />}
      </Group>

      <Group title="Argent">
        <Row
          icon={Wallet}
          label="Portefeuille"
          detail={formatAmount(profile.walletBalance)}
          onClick={() => navigate("/portefeuille")}
        />
        <InvoicesSheetButton asRow />
        <ReferralSheetButton asRow />
      </Group>

      <Group title="Mon profil">
        <Row
          icon={UserRound}
          label="Mes informations"
          onClick={() => navigate("/profile/informations")}
        />
      </Group>

      <Group title="Aide">
        <SupportContactButton asRow />
      </Group>

      {/* Deliberately quiet: so a support conversation can start with
          "which version?" and get an answer. */}
      <p className="text-center text-xs text-muted-foreground">
        Rabotka v{__APP_VERSION__}
      </p>
    </div>
  );
}

function StatTile({
  value,
  label,
  hint,
  onClick,
  ariaLabel,
}: Readonly<{
  value: string;
  label?: string;
  ariaLabel?: string;
  hint?: string;
  onClick?: () => void;
}>) {
  const body = (
    <>
      <span className="truncate text-base font-bold text-foreground">{value}</span>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      {hint && <span className="mt-0.5 text-xs font-medium text-whatsapp">{hint} ›</span>}
    </>
  );
  const className =
    "flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl bg-card px-2 py-3.5 text-center";
  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(className, "active:bg-secondary")}
    >
      {body}
    </button>
  ) : (
    <div className={className}>{body}</div>
  );
}

function Group({
  title,
  children,
}: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="divide-y divide-border/60 overflow-hidden rounded-xl bg-card">
        {children}
      </div>
    </section>
  );
}

function Row({
  icon: Icon,
  label,
  detail,
  onClick,
}: Readonly<{
  icon: React.ElementType;
  label: string;
  detail?: string;
  onClick: () => void;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-foreground active:bg-muted"
    >
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="flex-1 text-sm font-medium">{label}</span>
      {detail && (
        <span className="max-w-[45%] truncate text-xs text-muted-foreground">
          {detail}
        </span>
      )}
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

const AccountStatusBadge = ({
  status,
}: Readonly<{ status: ProfileMeResponse["status"] }>) => {
  const config = {
    ACTIVE: { label: "Actif", className: "bg-green-100 text-green-700" },
    PENDING_ACTIVATION: {
      label: "Activation en attente",
      className: "bg-yellow-100 text-yellow-700",
    },
    SUSPENDED: { label: "Suspendu", className: "bg-orange-100 text-orange-700" },
    BANNED: { label: "Banni", className: "bg-red-100 text-red-700" },
  };
  const { label, className } = config[status];
  return (
    <Badge className={cn("mt-1 border-0 text-xs", className)}>
      {label}
    </Badge>
  );
};

const ProfileSkeleton = () => (
  <div className="w-full space-y-6">
    <div className="flex items-center gap-4 rounded-xl bg-card p-4">
      <Skeleton className="size-16 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3.5 w-36" />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2.5">
      <Skeleton className="h-20 rounded-xl" />
      <Skeleton className="h-20 rounded-xl" />
      <Skeleton className="h-20 rounded-xl" />
    </div>
    <Skeleton className="h-28 rounded-xl" />
    <Skeleton className="h-40 rounded-xl" />
  </div>
);
