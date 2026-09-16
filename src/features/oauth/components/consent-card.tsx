import { Link } from "react-router";
import rabotkaLogo from "@/assets/rabotka-logo.png?format=webp";
import { consentContent } from "@/content/oauth/consent";

type ConsentCardProps = {
  readonly children: React.ReactNode;
  /** Omitted on the error screen, where there is no application to name. */
  readonly appName?: string;
  /** Replaces the sign-in heading, for Rabotka screens that are not a login. */
  readonly title?: string;
  /** Replaces "pour continuer vers <app>". */
  readonly subtitle?: string;
};

/**
 * The frame every consent step renders inside.
 *
 * Modelled on the sign-in card people already know from Google: the identity
 * provider's mark at the top, then "Se connecter avec Rabotka", then "pour
 * continuer vers <app>". That order is the point — the user must read whose
 * account they are using before they read who is asking for it, or the screen
 * becomes the partner's login page with a Rabotka button on it.
 *
 * One card, `bg-card shadow-soft`, no borders: surfaces here are separated by
 * elevation. It is sized for the ~480px popup a partner opens, and centres
 * itself when it is a full page instead.
 */
export function ConsentCard({
  children,
  appName,
  title,
  subtitle,
}: Readonly<ConsentCardProps>) {
  const caption =
    subtitle ?? (appName ? consentContent.header.continueTo(appName) : null);

  return (
    // `bg-background` explicitly: it is the warm off-white (40 30% 98%) that the
    // pure-white card sits on. Without it the page inherits whatever is behind
    // it, the card loses its contrast, and `shadow-soft` is the only thing left
    // separating the two.
    <div className="bg-background flex min-h-svh items-center justify-center px-4 py-10">
      <div className="w-full max-w-115">
        <div className="bg-card shadow-soft rounded-2xl px-8 py-10 sm:px-10">
          <header className="flex flex-col items-center text-center">
            <img
              src={rabotkaLogo}
              alt="Rabotka"
              className="h-12 w-auto object-contain"
            />
            <h1 className="mt-6 text-2xl font-semibold tracking-tight">
              {title ?? consentContent.header.title}
            </h1>
            {caption && (
              <p className="text-muted-foreground mt-1.5 text-[15px]">
                {caption}
              </p>
            )}
          </header>

          <div className="mt-8">{children}</div>
        </div>

        {/*
          Outside the card, like the small print under a Google dialog: present
          on every step without competing with the decision inside it.
        */}
        <div className="text-muted-foreground mt-4 flex items-center justify-center gap-4 text-xs">
          <Link
            to="/privacy"
            target="_blank"
            className="hover:text-foreground transition-colors"
          >
            {consentContent.footer.privacy}
          </Link>
          <span aria-hidden>·</span>
          <Link
            to="/terms"
            target="_blank"
            className="hover:text-foreground transition-colors"
          >
            {consentContent.footer.terms}
          </Link>
        </div>
      </div>
    </div>
  );
}
