import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { consentContent } from "@/content/oauth/consent";
import { ScopeList } from "./scope-list";

type ConsentStepProps = {
  readonly profile: { firstName: string; lastName: string; phoneHint: string };
  readonly scopes: readonly string[];
  readonly isDeciding: boolean;
  readonly onApprove: () => void;
  readonly onDeny: () => void;
};

/**
 * The decision itself.
 *
 * "Refuser" is a real button of equal weight, not a link tucked under the
 * primary action. A consent screen where declining is hard to find is not
 * collecting consent.
 */
export function ConsentStep({
  profile,
  scopes,
  isDeciding,
  onApprove,
  onDeny,
}: Readonly<ConsentStepProps>) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-card p-4 shadow-soft">
        <p className="text-sm font-medium">
          {consentContent.consent.signedInAs(
            `${profile.firstName} ${profile.lastName}`,
            profile.phoneHint,
          )}
        </p>
      </div>

      <ScopeList scopes={scopes} />

      <div className="space-y-2">
        <Button className="w-full" onClick={onApprove} disabled={isDeciding}>
          {isDeciding ? (
            <Loader2 aria-hidden className="size-4 animate-spin" />
          ) : (
            consentContent.consent.approve
          )}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={onDeny}
          disabled={isDeciding}
        >
          {consentContent.consent.deny}
        </Button>
      </div>

      <p className="text-center text-xs leading-snug text-muted-foreground">
        {consentContent.consent.footnote}
      </p>
    </div>
  );
}
