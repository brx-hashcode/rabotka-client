import { Link } from "react-router";
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { config } from "@/config";
import { whatsappOnlyContent } from "@/content/whatsapp-only";

type Props = Readonly<{
  /** Where "Continuer quand même" resumes, carried into /login. */
  destination: string;
}>;

/**
 * Shown instead of the OTP form when a signed-out visitor reaches a guarded
 * route without ever having followed a WhatsApp link.
 *
 * Their session cookie is not missing by accident — it lives in WhatsApp's
 * webview cookie jar, so the same URL in a normal browser is simply a logged
 * out app. Sending them back to the conversation restores it in one tap, where
 * the login form asks them to re-verify a number they already own.
 *
 * The way through is kept deliberately: this is wayfinding, not access control
 * (the login code and the OTP are what actually guard the account), and a
 * refusal with no exit turns any false positive into an unreproducible support
 * case.
 */
export function WhatsAppOnlyScreen({ destination }: Props) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="bg-muted flex size-14 items-center justify-center rounded-full">
        <MessageCircle className="text-muted-foreground size-7" />
      </div>

      <div className="space-y-1">
        <p className="text-foreground text-sm font-medium">
          {whatsappOnlyContent.title}
        </p>
        <p className="text-muted-foreground max-w-xs text-xs">
          {whatsappOnlyContent.body}
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2">
        <Button
          variant="whatsapp"
          onClick={() => {
            // `location.assign`, never `window.open`: these links are followed
            // from webviews where opening a new context is silently dropped.
            globalThis.location.assign(config.whatsapp.links.start);
          }}
        >
          {whatsappOnlyContent.ctaLabel}
        </Button>
        <Link
          to={`/login?redirect=${encodeURIComponent(destination)}`}
          replace
          className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-2"
        >
          {whatsappOnlyContent.fallbackLabel}
        </Link>
      </div>
    </div>
  );
}
