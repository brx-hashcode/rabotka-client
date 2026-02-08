import { useQuery } from "@tanstack/react-query";
import { getMe, type ProfileMeResponse } from "@/lib/api/profile-controller";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function ProfileSkeleton() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <Skeleton className="h-8 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );
}

function getStatusBadgeVariant(
  status: ProfileMeResponse["status"],
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "PENDING_PAYMENT":
      return "secondary";
    case "SUSPENDED":
    case "BANNED":
      return "destructive";
    default:
      return "outline";
  }
}

function getVerificationBadgeVariant(
  status: ProfileMeResponse["verificationStatus"],
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "VERIFIED":
      return "default";
    case "PENDING":
      return "secondary";
    case "REJECTED":
      return "destructive";
    default:
      return "outline";
  }
}

function formatStatus(status: string): string {
  return status.split("_").join(" ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export default function Dashboard() {
  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: getMe,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <ProfileSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
          <div className="flex gap-2">
            <Badge variant={getStatusBadgeVariant(profile.status)}>
              {formatStatus(profile.status)}
            </Badge>
            <Badge variant={getVerificationBadgeVariant(profile.verificationStatus)}>
              {formatStatus(profile.verificationStatus)}
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {profile.firstName} {profile.lastName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium">{profile.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Adresse</p>
                <p className="font-medium">{profile.address}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type de profil</p>
                <p className="font-medium">{formatStatus(profile.profileType)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score de fiabilité</p>
                <p className="font-medium">
                  {profile.reliabilityScore === null ? "N/A" : `${profile.reliabilityScore}%`}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">WhatsApp connecté</p>
                <p className="font-medium">{profile.whatsappConnected ? "Oui" : "Non"}</p>
              </div>
            </div>
            {profile.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{profile.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
