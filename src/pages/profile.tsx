import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useProfileMe } from "@/hooks/use-profile-me";
import { useLogout } from "@/hooks/use-logout";
import { User, LogOut, BadgeCheck } from "lucide-react";
import { PenaltiesSheetButton } from "@/features/profile/components/penalties-sheet-button";
import { ApplicationsSheetButton } from "@/features/profile/components/applications-sheet-button";
import { EditProfileSheetButton } from "@/features/profile/components/edit-profile-sheet-button";
import { useEffect } from "react";
import { ProfileMeResponse } from "@/lib/api/profile-controller";
import { editProfileContent } from "@/content/profile";

const WHATSAPP_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 212 212'%3E%3Cpath fill='%23DFE5E7' d='M106.251.5C164.653.5 212 47.846 212 106.25S164.653 212 106.25 212C47.846 212 .5 164.654.5 106.25S47.846.5 106.251.5z'/%3E%3Cpath fill='%23FFF' d='M173.561 171.615a62.767 62.767 0 0 0-2.065-2.955 67.7 67.7 0 0 0-2.608-3.299 70.112 70.112 0 0 0-3.184-3.527 71.097 71.097 0 0 0-5.924-5.47 72.458 72.458 0 0 0-10.204-7.026 75.2 75.2 0 0 0-5.98-3.055c-.062-.028-.118-.059-.18-.087-9.792-4.44-22.106-7.529-37.416-7.529s-27.624 3.089-37.416 7.529c-.338.153-.653.318-.985.474a75.37 75.37 0 0 0-6.229 3.298 72.589 72.589 0 0 0-9.15 6.395 71.243 71.243 0 0 0-5.924 5.47 70.064 70.064 0 0 0-3.184 3.527 67.142 67.142 0 0 0-2.609 3.299 63.292 63.292 0 0 0-2.065 2.955 56.33 56.33 0 0 0-1.447 2.324c-.033.056-.073.119-.104.174a47.92 47.92 0 0 0-1.07 1.926c-.559 1.068-.818 1.678-.818 1.678v.398c18.285 17.927 43.322 28.985 70.945 28.985 27.678 0 52.761-11.103 71.055-29.095v-.289s-.619-1.45-1.992-3.778a58.346 58.346 0 0 0-1.446-2.322zM106.002 125.5c2.645 0 5.212-.253 7.68-.737a38.272 38.272 0 0 0 3.624-.896 37.124 37.124 0 0 0 5.12-1.958 36.307 36.307 0 0 0 6.15-3.67 35.923 35.923 0 0 0 9.489-10.48 36.558 36.558 0 0 0 2.422-4.84 37.051 37.051 0 0 0 1.716-5.25c.299-1.208.542-2.443.725-3.701.275-1.887.417-3.827.417-5.811s-.142-3.925-.417-5.811a38.734 38.734 0 0 0-1.215-5.494 36.68 36.68 0 0 0-3.648-8.298 35.923 35.923 0 0 0-9.489-10.48 36.347 36.347 0 0 0-6.15-3.67 37.124 37.124 0 0 0-5.12-1.958 37.67 37.67 0 0 0-3.624-.896 39.875 39.875 0 0 0-7.68-.737c-21.162 0-37.345 16.183-37.345 37.345 0 21.159 16.183 37.342 37.345 37.342z'/%3E%3C/svg%3E";

const content = editProfileContent;

export default function Profile() {
  const { data: profile, isLoading, error } = useProfileMe();
  const { mutate: handleLogout, isPending: isLoggingOut } = useLogout();

  useEffect(() => {
    if (typeof globalThis !== "undefined") {
      globalThis.history.scrollRestoration = "manual";
      globalThis.scrollTo(0, 0);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="pt-24 lg:pt-28 pb-8 px-4 md:px-8">
        <ProfileSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 lg:pt-28 pb-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Erreur</h1>
          <p className="text-muted-foreground">
            Impossible de charger votre profil. Veuillez vous reconnecter.
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const initials =
    `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`.toUpperCase();
  const isVerified = profile.verificationStatus === "VERIFIED";

  return (
    <div className="pt-24 lg:pt-28 pb-8 px-4 md:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-end">
          <EditProfileSheetButton profile={profile} />
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-primary/20">
              <AvatarImage
                src={profile.avatarUrl ?? WHATSAPP_PLACEHOLDER}
                alt={fullName}
                className="object-cover"
              />
              <AvatarFallback className="bg-muted text-muted-foreground text-3xl">
                {initials || <User className="h-12 w-12" />}
              </AvatarFallback>
            </Avatar>
            {isVerified && (
              <div className="absolute bottom-1 right-1 bg-primary rounded-full p-1.5 border-2 border-background">
                <BadgeCheck className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold text-foreground text-center">
            {fullName}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProfileInfoItem label="Email" value={profile.email} />
          <ProfileInfoItem label="Téléphone" value={profile.phone} />
          <ProfileInfoItem label="Adresse" value={profile.address} />
          <ProfileInfoItem
            label="Type de profil"
            value={translateProfileType(profile.profileType)}
          />
          <ProfileInfoItem
            label="Score de fiabilité"
            value={
              profile.reliabilityScore === null
                ? null
                : `${profile.reliabilityScore}%`
            }
          />
          <ProfileInfoItem
            label="WhatsApp connecté"
            value={profile.whatsappConnected ? "Oui" : "Non"}
          />
        </div>

        {profile.description && (
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-sm text-muted-foreground mb-1">
              {content.fields.description.label}
            </p>
            <p className="font-medium text-foreground">{profile.description}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PenaltiesSheetButton />
            <ApplicationsSheetButton />
          </div>

          <Button
            variant="ghost"
            className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? "Déconnexion..." : "Se déconnecter"}
          </Button>
        </div>
      </div>
    </div>
  );
}

const ProfileSkeleton = () => {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="flex flex-col items-center space-y-4">
        <Skeleton className="h-32 w-32 rounded-full" />
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["email", "phone", "address", "type", "score", "whatsapp"].map(
          (field) => (
            <div key={field} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-full" />
            </div>
          ),
        )}
      </div>
    </div>
  );
};

const formatStatus = (status: string): string => {
  return status
    .split("_")
    .join(" ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
};

const ProfileInfoItem = ({
  label,
  value,
}: Readonly<{
  label: string;
  value: string | number | null;
}>) => {
  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="font-medium text-foreground">{value ?? "N/A"}</p>
    </div>
  );
};

const translateProfileType = (
  profileType: ProfileMeResponse["profileType"],
): string => {
  switch (profileType) {
    case "EMPLOYER":
      return "Employeur";
    case "WORKER":
      return "Travailleur";
    default:
      return "Inconnu";
  }
};
