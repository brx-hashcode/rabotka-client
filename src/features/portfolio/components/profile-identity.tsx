import { Camera, MapPin, ShieldCheck, Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  fullName: string;
  avatarUrl: string | null;
  location: string | null;
  ratingAvg: number | null;
  ratingCount: number;
  reliabilityScore: number | null;
  /** Shown when known: the public page has it, the owner's page does not. */
  completedMissions?: number | null;
  /** The owner's page: tapping the avatar leads to adding a photo. */
  onAvatarClick?: () => void;
};

/**
 * Who this is, in one compact row: photo, name, place, and the trust signals
 * an employer looks for (rating, missions, reliability).
 *
 * Shared by the owner's « Mes publications » and the public portfolio, so a
 * worker sees their page exactly as an employer will. Replaces a centred
 * header with a 96px avatar and a gradient wash, which took half a phone
 * screen before the first piece of work.
 */
export function ProfileIdentity({
  fullName,
  avatarUrl,
  location,
  ratingAvg,
  ratingCount,
  reliabilityScore,
  completedMissions,
  onAvatarClick,
}: Readonly<Props>) {
  const avatar = (
    <>
      <Avatar className="size-16">
        {avatarUrl && (
          <AvatarImage src={avatarUrl} alt={fullName} className="object-cover" />
        )}
        <AvatarFallback className="bg-lime text-lg font-semibold text-lime-foreground">
          {initialsOf(fullName)}
        </AvatarFallback>
      </Avatar>
      {onAvatarClick && !avatarUrl && (
        // The first thing an employer looks at: ask for it on the owner's side.
        <span className="absolute -bottom-0.5 -right-0.5 flex size-6 items-center justify-center rounded-full bg-whatsapp text-white ring-2 ring-card">
          <Camera className="size-3.5" />
        </span>
      )}
    </>
  );

  return (
    // In a soft card, so the identity reads as one block above the work.
    <section className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-soft">
      {onAvatarClick ? (
        <button
          type="button"
          onClick={onAvatarClick}
          aria-label={avatarUrl ? "Ma photo" : "Ajouter une photo de profil"}
          className="relative shrink-0"
        >
          {avatar}
        </button>
      ) : (
        <div className="relative shrink-0">{avatar}</div>
      )}

      <div className="min-w-0 space-y-1">
        <h1 className="truncate text-lg font-bold text-foreground">{fullName}</h1>
        {location && (
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            {location}
          </p>
        )}
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {ratingCount > 0 && ratingAvg != null ? (
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              {ratingAvg.toFixed(1)}
              <span className="font-normal text-muted-foreground">
                ({ratingCount} avis)
              </span>
            </span>
          ) : (
            <span>Pas encore d'avis</span>
          )}
          {completedMissions != null && completedMissions > 0 && (
            <span>
              {completedMissions} mission{completedMissions > 1 ? "s" : ""}
            </span>
          )}
          {reliabilityScore != null && (
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-whatsapp" />
              {reliabilityScore} % fiable
            </span>
          )}
        </p>
      </div>
    </section>
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
