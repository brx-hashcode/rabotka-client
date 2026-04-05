import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useProfileMe } from "@/hooks/use-profile-me";
import { useLogout } from "@/hooks/use-logout";
import { useNavigate } from "react-router";
import {
  User,
  LogOut,
  BadgeCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  ClipboardList,
  FileWarning,
  Shield,
  Star,
  MessageCircle,
  AlertCircle,
  Wallet,
} from "lucide-react";
import { PenaltiesSheetButton } from "@/features/profile/components/penalties-sheet-button";
import { ApplicationsSheetButton } from "@/features/profile/components/applications-sheet-button";
import { EditProfileSheetButton } from "@/features/profile/components/edit-profile-sheet-button";
import { useEffect } from "react";
import type { ProfileMeResponse } from "@/lib/api/profile-controller";
import { cn, formatDate } from "@/lib/utils";

const WHATSAPP_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 212 212'%3E%3Cpath fill='%23DFE5E7' d='M106.251.5C164.653.5 212 47.846 212 106.25S164.653 212 106.25 212C47.846 212 .5 164.654.5 106.25S47.846.5 106.251.5z'/%3E%3Cpath fill='%23FFF' d='M173.561 171.615a62.767 62.767 0 0 0-2.065-2.955 67.7 67.7 0 0 0-2.608-3.299 70.112 70.112 0 0 0-3.184-3.527 71.097 71.097 0 0 0-5.924-5.47 72.458 72.458 0 0 0-10.204-7.026 75.2 75.2 0 0 0-5.98-3.055c-.062-.028-.118-.059-.18-.087-9.792-4.44-22.106-7.529-37.416-7.529s-27.624 3.089-37.416 7.529c-.338.153-.653.318-.985.474a75.37 75.37 0 0 0-6.229 3.298 72.589 72.589 0 0 0-9.15 6.395 71.243 71.243 0 0 0-5.924 5.47 70.064 70.064 0 0 0-3.184 3.527 67.142 67.142 0 0 0-2.609 3.299 63.292 63.292 0 0 0-2.065 2.955 56.33 56.33 0 0 0-1.447 2.324c-.033.056-.073.119-.104.174a47.92 47.92 0 0 0-1.07 1.926c-.559 1.068-.818 1.678-.818 1.678v.398c18.285 17.927 43.322 28.985 70.945 28.985 27.678 0 52.761-11.103 71.055-29.095v-.289s-.619-1.45-1.992-3.778a58.346 58.346 0 0 0-1.446-2.322zM106.002 125.5c2.645 0 5.212-.253 7.68-.737a38.272 38.272 0 0 0 3.624-.896 37.124 37.124 0 0 0 5.12-1.958 36.307 36.307 0 0 0 6.15-3.67 35.923 35.923 0 0 0 9.489-10.48 36.558 36.558 0 0 0 2.422-4.84 37.051 37.051 0 0 0 1.716-5.25c.299-1.208.542-2.443.725-3.701.275-1.887.417-3.827.417-5.811s-.142-3.925-.417-5.811a38.734 38.734 0 0 0-1.215-5.494 36.68 36.68 0 0 0-3.648-8.298 35.923 35.923 0 0 0-9.489-10.48 36.347 36.347 0 0 0-6.15-3.67 37.124 37.124 0 0 0-5.12-1.958 37.67 37.67 0 0 0-3.624-.896 39.875 39.875 0 0 0-7.68-.737c-21.162 0-37.345 16.183-37.345 37.345 0 21.159 16.183 37.342 37.345 37.342z'/%3E%3C/svg%3E";

export default function Profile() {
  const navigate = useNavigate();
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
  const isEmployer = profile.profileType === "EMPLOYER";

  return (
    <div className="pt-24 lg:pt-28 pb-8 px-4 md:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="relative bg-linear-to-b from-whatsapp/10 to-transparent rounded-2xl pt-8 pb-6 px-6">
          <div className="absolute top-4 right-4">
            <EditProfileSheetButton profile={profile} />
          </div>

          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <Avatar className="h-28 w-28 border-4 border-white shadow-md">
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
                <div className="absolute bottom-0 right-0 bg-whatsapp rounded-full p-1.5 border-2 border-white shadow-sm">
                  <BadgeCheck className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-foreground">{fullName}</h2>
              <p className="text-sm text-muted-foreground">
                {translateProfileType(profile.profileType)}
              </p>
            </div>

            <AccountStatusBadge status={profile.status} />
          </div>
        </div>

        <div className={cn("grid gap-3 grid-cols-3")}>
          <StatCard
            icon={<Wallet className="h-5 w-5 text-whatsapp" />}
            value={profile.walletBalance.toLocaleString("fr-FR")}
            label="Solde (FCFA)"
          />

          {isEmployer ? (
            <StatCard
              icon={<Briefcase className="h-5 w-5 text-whatsapp" />}
              value={profile.jobOffersCount}
              label="Offres publiees"
            />
          ) : (
            <StatCard
              icon={<ClipboardList className="h-5 w-5 text-whatsapp" />}
              value={profile.applicationsCount}
              label="Candidatures"
            />
          )}

          <StatCard
            icon={<Star className="h-5 w-5 text-yellow-500" />}
            value={
              profile.reliabilityScore === null
                ? "N/A"
                : `${profile.reliabilityScore}%`
            }
            label="Fiabilite"
          />
        </div>

        {profile.description && (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                A propos
              </p>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-foreground leading-relaxed">
                {profile.description}
              </p>
            </div>
          </div>
        )}

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Informations
            </p>
          </div>
          <div className="divide-y divide-border">
            <InfoRow
              icon={<Phone className="h-4 w-4 text-whatsapp" />}
              label="Telephone"
              value={profile.phone}
            />
            <InfoRow
              icon={<Mail className="h-4 w-4 text-whatsapp" />}
              label="Email"
              value={profile.email}
            />
            <InfoRow
              icon={<MapPin className="h-4 w-4 text-whatsapp" />}
              label="Adresse"
              value={profile.address}
            />
            <InfoRow
              icon={<Calendar className="h-4 w-4 text-whatsapp" />}
              label="Membre depuis"
              value={formatDate(profile.createdAt)}
            />
            <InfoRow
              icon={<Shield className="h-4 w-4 text-whatsapp" />}
              label="Verification KYC"
              value={translateVerificationStatus(profile.verificationStatus)}
            />
            <InfoRow
              icon={<MessageCircle className="h-4 w-4 text-whatsapp" />}
              label="WhatsApp"
              value={profile.whatsappConnected ? "Connecte" : "Non connecte"}
            />
            {!isEmployer && (
              <InfoRow
                icon={<FileWarning className="h-4 w-4 text-amber-500" />}
                label="Penalites"
                value={`${profile.penaltiesCount} penalite${profile.penaltiesCount !== 1 ? "s" : ""}${profile.unpaidPenaltiesCount > 0 ? ` (${profile.unpaidPenaltiesCount} impayee${profile.unpaidPenaltiesCount !== 1 ? "s" : ""})` : ""}`}
              />
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {!isEmployer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <PenaltiesSheetButton />
              <ApplicationsSheetButton />
            </div>
          )}

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => navigate("/claims")}
          >
            <AlertCircle className="h-4 w-4" />
            Mes Reclamations
          </Button>

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
            {isLoggingOut ? "Deconnexion..." : "Se deconnecter"}
          </Button>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({
  icon,
  value,
  label,
  alert,
}: Readonly<{
  icon: React.ReactNode;
  value: number | string;
  label: string;
  alert?: boolean;
}>) => (
  <div
    className={cn(
      "bg-card rounded-xl border p-4 flex flex-col items-center gap-1.5 text-center",
      alert ? "border-amber-300 bg-amber-50/50" : "border-border",
    )}
  >
    {icon}
    <span className="text-lg font-bold text-foreground">{value}</span>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

const InfoRow = ({
  icon,
  label,
  value,
}: Readonly<{
  icon: React.ReactNode;
  label: string;
  value: string;
}>) => (
  <div className="flex items-center gap-3 px-4 py-3">
    <div className="shrink-0">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground truncate">{value}</p>
    </div>
  </div>
);

const AccountStatusBadge = ({
  status,
}: Readonly<{ status: ProfileMeResponse["status"] }>) => {
  const config = {
    ACTIVE: {
      label: "Actif",
      className: "bg-green-100 text-green-700 border-0",
    },
    PENDING_ACTIVATION: {
      label: "Activation en attente",
      className: "bg-yellow-100 text-yellow-700 border-0",
    },
    SUSPENDED: {
      label: "Suspendu",
      className: "bg-orange-100 text-orange-700 border-0",
    },
    BANNED: { label: "Banni", className: "bg-red-100 text-red-700 border-0" },
  };
  const { label, className } = config[status];
  return <Badge className={cn("text-xs", className)}>{label}</Badge>;
};

const ProfileSkeleton = () => {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="bg-muted/20 rounded-2xl pt-8 pb-6 px-6">
        <div className="flex flex-col items-center space-y-3">
          <Skeleton className="h-28 w-28 rounded-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <Skeleton className="h-20 rounded-xl" />
      <div className="rounded-xl border border-border overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-4 w-4 rounded" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
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

const translateVerificationStatus = (
  status: ProfileMeResponse["verificationStatus"],
): string => {
  switch (status) {
    case "VERIFIED":
      return "Verifie";
    case "PENDING":
      return "En attente";
    case "REJECTED":
      return "Rejete";
    default:
      return "Inconnu";
  }
};
