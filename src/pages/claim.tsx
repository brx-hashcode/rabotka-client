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
      <div className="pt-8 lg:pt-10 pb-8 px-4 md:px-8 min-h-screen flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 space-y-4">
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="pt-8 lg:pt-10 pb-8 px-4 md:px-8 min-h-screen flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 space-y-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/claims")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="flex gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-700">
                Réclamation non trouvée
              </p>
              <p className="text-sm text-red-600">
                {error instanceof Error
                  ? error.message
                  : "Impossible de charger cette réclamation"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-8 lg:pt-10 pb-8 px-4 md:px-8 min-h-screen">
      <div className="max-w-2xl mx-auto w-full">
        <ClaimChat claim={claim} />
      </div>
    </div>
  );
}
