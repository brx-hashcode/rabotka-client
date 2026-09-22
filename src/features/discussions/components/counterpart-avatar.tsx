import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Props = {
  readonly name: string;
  readonly avatarUrl: string | null;
  readonly online: boolean;
  readonly className?: string;
};

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/**
 * The other party's photo, with a presence dot when they are connected.
 *
 * One component for the list and the thread header, so the dot means the same
 * thing in both places and cannot drift in size or colour between them.
 *
 * The dot is drawn only when online, never as a grey "offline" dot. The server
 * fails closed — false also means "could not tell" — so a grey dot would claim
 * a certainty nobody has.
 */
export function CounterpartAvatar({ name, avatarUrl, online, className }: Props) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <Avatar className="h-full w-full">
        {avatarUrl && (
          <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
        )}
        <AvatarFallback className="bg-muted text-sm font-semibold text-muted-foreground">
          {initialsOf(name)}
        </AvatarFallback>
      </Avatar>
      {online && (
        <span
          // The ring is the surface colour, so the dot reads as sitting on top
          // of the photo rather than bleeding into it.
          className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-whatsapp ring-2 ring-background"
          aria-label="En ligne"
        />
      )}
    </span>
  );
}
