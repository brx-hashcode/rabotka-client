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
    <div className="flex flex-col items-center">
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
    <header className="space-y-4">
      <div className="flex items-center gap-5 sm:gap-8">
        <Avatar className="size-20 shrink-0 border sm:size-24">
          {profile.avatarUrl && (
            <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
          )}
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex flex-1 items-center justify-around">
          <Stat value={String(realizationsCount)} label="Réalisations" />
          <Stat
            value={String(profile.completedMissionsCount)}
            label="Missions"
          />
          <Stat
            value={
              profile.reliabilityScore != null
                ? String(profile.reliabilityScore)
                : "—"
            }
            label="Fiabilité"
          />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-foreground text-base font-bold">
            {profile.fullName}
          </h1>
          {profile.ratingCount > 0 && profile.ratingAvg != null && (
            <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
              <Star className="size-3.5 fill-current text-amber-500" />
              {profile.ratingAvg.toFixed(1)} ({profile.ratingCount})
            </span>
          )}
        </div>
        {profile.description && (
          <p className="text-foreground/80 text-sm whitespace-pre-line">
            {profile.description}
          </p>
        )}
        {profile.address && (
          <p className="text-muted-foreground flex items-center gap-1 text-xs">
            <MapPin className="size-3.5 shrink-0" />
            {profile.address}
          </p>
        )}
      </div>

      {action}
    </header>
  );
}
