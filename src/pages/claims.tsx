import { useState } from "react";
import { useNavigate } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Inbox } from "lucide-react";
import { ScreenHeader } from "@/features/employer";
import { useProfileClaims } from "@/hooks/use-profile-claims";
import { ClaimCard } from "@/features/claims/components/claim-card";
import { claimsContent } from "@/content/claims";

export default function Claims() {
  const navigate = useNavigate();
  const [page] = useState(1);
  const limit = 10;

  const { data, isLoading } = useProfileClaims({ page, limit, enabled: true });

  const claims = data?.data ?? [];
  const hasClaims = claims.length > 0;

  const content = claimsContent.list;

  return (
    <div className="min-h-screen flex flex-col">
      <ScreenHeader
        title={content.title}
        action={
          <button
            type="button"
            aria-label={content.createButton}
            onClick={() => navigate("/claims/new")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-whatsapp text-white transition-colors hover:bg-whatsapp-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/40"
          >
            <Plus className="h-5 w-5" />
          </button>
        }
      />

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col space-y-6 pt-4 pb-8 px-4 md:px-8">
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        )}
        {!isLoading && !hasClaims && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-muted rounded-full p-6 mb-4">
              <Inbox className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="font-semibold text-lg mb-1">{content.emptyTitle}</p>
            {/* No CTA here: the header already carries a + button for exactly
                this action, and two controls doing the same thing on one empty
                screen just asks the user which one is the real one. */}
            <p className="text-muted-foreground max-w-sm">
              {content.emptyDescription}
            </p>
          </div>
        )}
        {!isLoading && hasClaims && (
          <div className="grid grid-cols-1 gap-4">
            {claims.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
