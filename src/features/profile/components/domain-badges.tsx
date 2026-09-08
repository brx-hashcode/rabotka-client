import { StatusChip } from "@/features/employer";

/**
 * A profile's domains, as badges.
 *
 * The name is rendered in the foreground colour rather than green. Green text
 * on a green tint measured about 1.8:1 against the 4.5:1 minimum, and no green
 * dark enough to pass in the light theme stays readable once the dark theme
 * flips the card behind it. So the tint carries the brand and the text carries
 * the meaning.
 *
 * 14px rather than the chip's default 12px, with roomier padding: these are
 * read on a phone, held at arm's length, and a domain name is content — not a
 * status label like the ones StatusChip was built for.
 *
 * Shared because both the public worker page and the owner's own profile show
 * the same list; they had drifted into three different treatments between them.
 */
export function DomainBadges({
  names,
}: Readonly<{ names: readonly string[] }>) {
  return (
    <div className="flex flex-wrap gap-2">
      {names.map((name) => (
        <StatusChip
          key={name}
          className="bg-whatsapp/10 text-foreground rounded-md px-3 py-1.5 text-sm"
        >
          {name}
        </StatusChip>
      ))}
    </div>
  );
}
