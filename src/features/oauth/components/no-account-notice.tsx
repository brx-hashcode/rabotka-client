import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { consentContent } from "@/content/oauth/consent";

type NoAccountNoticeProps = {
  readonly onRetry: () => void;
};

/**
 * The dead end for someone who has no Rabotka account.
 *
 * "Login with Rabotka" federates existing, verified Rabotka users — that is the
 * whole proposition, and offering a signup here would hand partners accounts
 * that were created seconds ago and verify nothing. So this screen sends people
 * to Rabotka's own signup and asks them to come back, rather than pretending
 * the flow can continue.
 *
 * The signup link opens in a new tab on purpose: this page is very often a
 * popup opened by the partner, and navigating it away destroys the login
 * attempt the user would be returning to.
 */
export function NoAccountNotice({ onRetry }: Readonly<NoAccountNoticeProps>) {
  return (
    <div className="space-y-4">
      <div className="flex gap-3 rounded-xl bg-muted p-4">
        <UserPlus aria-hidden className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium">{consentContent.noAccount.title}</p>
          <p className="text-sm leading-snug text-muted-foreground">
            {consentContent.noAccount.description}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Button asChild className="w-full">
          <a href="/onboarding" target="_blank" rel="noopener noreferrer">
            {consentContent.noAccount.createButton}
          </a>
        </Button>
        <Button variant="ghost" className="w-full" onClick={onRetry}>
          {consentContent.noAccount.retryButton}
        </Button>
      </div>
    </div>
  );
}
