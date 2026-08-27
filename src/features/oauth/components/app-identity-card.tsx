import { consentContent } from "@/content/oauth/consent";

type AppIdentityCardProps = {
  readonly name: string;
  readonly description: string;
  readonly logoUrl: string | null;
};

/**
 * Who is asking.
 *
 * Sits at the top of every step, unchanged, so that the question the user is
 * actually answering — "do I trust this company?" — stays on screen while they
 * type a phone number and a code. A consent screen that only names the
 * application on the final step asks people to decide after they have already
 * committed.
 */
export function AppIdentityCard({
  name,
  description,
  logoUrl,
}: Readonly<AppIdentityCardProps>) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          className="size-14 rounded-xl object-cover shadow-soft"
        />
      ) : (
        // Initials rather than a generic placeholder icon: an app with no logo
        // still needs to look like a specific company, or every unbranded
        // integration looks identical to every other one.
        <div className="flex size-14 items-center justify-center rounded-xl bg-muted text-lg font-semibold text-muted-foreground shadow-soft">
          {initials(name)}
        </div>
      )}

      <div className="space-y-1">
        <h1 className="text-lg font-semibold leading-tight">
          {consentContent.header.subtitle(name)}
        </h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}
