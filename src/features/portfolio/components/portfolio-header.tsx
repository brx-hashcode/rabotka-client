import type { ReactNode } from "react";
import { MapPin, Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { PortfolioProfile } from "../types";

type Props = {
  profile: PortfolioProfile;
  realizationsCount: number;
  /** Optional owner action (e.g. an "Add" button). */
  action?: ReactNode;
};

function Stat({ value, label }: Readonly<{ value: string; label: string }>) {
  return (
    <div className="flex flex-col items-center px-6">
      <span className="text-foreground text-lg font-bold leading-none">
        {value}
      </span>
      <span className="text-muted-foreground mt-1 text-xs">{label}</span>
    </div>
  );
}

export function PortfolioHeader({
  profile,
  realizationsCount,
  action,
}: Readonly<Props>) {
  const initials =
    profile.fullName
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    // Same top wash as the profile screen (see pages/profile.tsx), so the two
    // profile surfaces read as one. Bleeds past the page padding with -mx-4 so
    // the colour reaches the screen edges rather than floating in a card.
    <header className="-mx-4 flex flex-col items-center space-y-4 rounded-b-2xl bg-linear-to-b from-whatsapp/10 to-transparent px-4 pb-6 pt-8 text-center">
      <Avatar className="size-24 border">
        {profile.avatarUrl && (
          <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
        )}
        <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
      </Avatar>

      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <h1 className="text-foreground text-lg font-bold">
            {profile.fullName}
          </h1>
          {profile.ratingCount > 0 && profile.ratingAvg != null && (
            <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
              <Star className="size-3.5 fill-current text-amber-500" />
              {profile.ratingAvg.toFixed(1)} ({profile.ratingCount})
            </span>
          )}
        </div>
        {profile.address && (
          <p className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
            <MapPin className="size-3.5 shrink-0" />
            {profile.address}
          </p>
        )}
      </div>

      <div className="flex items-center justify-center divide-x divide-border">
        <Stat value={String(realizationsCount)} label="Réalisations" />
        {profile.completedMissionsCount != null && (
          <Stat
            value={String(profile.completedMissionsCount)}
            label="Missions"
          />
        )}
        <Stat
          value={
            profile.reliabilityScore != null
              ? String(profile.reliabilityScore)
              : "—"
          }
          label="Fiabilité"
        />
      </div>

      {action}
    </header>
  );
}
