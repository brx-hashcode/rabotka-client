import { useParams, useNavigate } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useProfileClaim } from "@/hooks/use-profile-claim";
import { ClaimChat } from "@/features/claims/components/claim-chat";

export default function Claim() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: claim, isLoading, error } = useProfileClaim(id);

  if (isLoading) {
    return (
      <div className="px-4 py-4">
        <Skeleton className="h-[70vh] w-full rounded-xl" />
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="rounded-full bg-muted p-6">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <p className="max-w-xs text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "Impossible de charger cette réclamation."}
        </p>
        <Button onClick={() => navigate("/claims")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux réclamations
        </Button>
      </div>
    );
  }

  return <ClaimChat claim={claim} />;
}
