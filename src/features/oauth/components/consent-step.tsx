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
 * "Refuser" is a real button of equal size sitting beside "Autoriser", not a
 * link tucked underneath. A consent screen where declining is harder to find
 * than accepting is not collecting consent.
 */
export function ConsentStep({
  profile,
  scopes,
  isDeciding,
  onApprove,
  onDeny,
}: Readonly<ConsentStepProps>) {
  const initials =
    `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`.toUpperCase();

  return (
    <div className="space-y-6">
      {/*
        Who they are signing in as. Sits directly above the list of what will be
        shared, with only a hairline between them, because the two are one
        sentence: this person's name, phone and status go to that application.
      */}
      <div>
        <div className="flex items-center gap-3 pb-5">
          <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="text-muted-foreground text-xs">{profile.phoneHint}</p>
          </div>
        </div>

        {/* A tinted rule, not a border — the house rule is no borders. */}
        <div className="bg-border/60 h-px" />

        <div className="pt-5">
          <ScopeList scopes={scopes} />
        </div>
      </div>

      {/*
        Side by side, refuse first. Left-to-right readers reach the safe option
        before the consequential one, and neither is styled to look like the
        obvious answer.
      */}
      <div className="grid grid-cols-2 gap-3">
        {/*
          `secondary`, not `ghost`: ghost is transparent until hovered, so on a
          white card it read as an empty outlined box rather than a button. It
          has to look as pressable as "Autoriser" — declining is a real choice,
          not a way out of the screen.
        */}
        <Button variant="secondary" onClick={onDeny} disabled={isDeciding}>
          {consentContent.consent.deny}
        </Button>
        <Button onClick={onApprove} disabled={isDeciding}>
          {isDeciding ? (
            <Loader2 aria-hidden className="size-4 animate-spin" />
          ) : (
            consentContent.consent.approve
          )}
        </Button>
      </div>

      <p className="text-muted-foreground text-center text-xs leading-relaxed">
        {consentContent.consent.footnote}
      </p>
    </div>
  );
}
