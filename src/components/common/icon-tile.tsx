import { cn } from "@/lib/utils";

/**
 * The agent app's icon tile: a rounded square, lime with dark-green ink by
 * default. Replaces the round `bg-whatsapp/10` green circles.
 */
export function IconTile({
  children,
  className,
  tone = "lime",
  size = "md",
}: Readonly<{
  children: React.ReactNode;
  className?: string;
  tone?: "lime" | "green" | "amber" | "violet" | "red" | "neutral";
  size?: "sm" | "md" | "lg";
}>) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center",
        size === "sm" && "size-8 rounded-lg [&_svg]:size-4",
        size === "md" && "size-10 rounded-xl [&_svg]:size-5",
        size === "lg" && "size-14 rounded-2xl [&_svg]:size-6",
        tone === "lime" && "bg-lime text-lime-foreground",
        tone === "green" && "bg-chip-green text-chip-green-foreground",
        tone === "amber" && "bg-chip-amber text-chip-amber-foreground",
        tone === "violet" && "bg-chip-violet text-chip-violet-foreground",
        tone === "red" && "bg-destructive/10 text-destructive",
        tone === "neutral" && "bg-secondary text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
