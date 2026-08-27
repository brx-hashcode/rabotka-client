type AppIdentityRowProps = {
  readonly name: string;
  readonly description: string;
  readonly logoUrl: string | null;
};

/**
 * The application, as a compact row rather than a hero block.
 *
 * The card's own heading already says "pour continuer vers <name>", so this is
 * confirmation and detail, not the headline — it sits inset and quiet. An
 * earlier version centred the logo and name at 18px above everything else,
 * which gave the partner's branding more weight on the screen than Rabotka's
 * and read like the partner's own login page.
 */
export function AppIdentityRow({
  name,
  description,
  logoUrl,
}: Readonly<AppIdentityRowProps>) {
  return (
    <div className="bg-muted/60 flex items-center gap-3.5 rounded-xl p-3.5">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          className="size-10 shrink-0 rounded-lg object-cover"
        />
      ) : (
        // Initials rather than a generic icon: an app with no logo should still
        // look like a specific company, or every unbranded partner looks
        // identical to every other one.
        <div className="bg-background text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold">
          {initials(name)}
        </div>
      )}

      <div className="min-w-0">
        <p className="truncate text-[15px] font-medium">{name}</p>
        <p className="text-muted-foreground line-clamp-1 text-[13px]">
          {description}
        </p>
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
