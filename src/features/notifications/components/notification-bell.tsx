import { Bell } from "lucide-react";
import { Link } from "react-router";
import { notificationsContent } from "@/content/notifications";
import { useUnreadNotificationsCount } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { badgeText } from "../read-state";

/**
 * The worker header's entry to the notification feed. Sized and styled like the
 * Bookmark button beside it, so the two read as one group.
 */
export function NotificationBell({
  tone = "default",
}: Readonly<{
  /** `onLime`: on the brand band (BrandHero), a translucent ink tile. */
  tone?: "default" | "onLime";
}> = {}) {
  const { data: unread = 0 } = useUnreadNotificationsCount();
  const badge = badgeText(unread);

  return (
    <Link
      to="/notifications"
      aria-label={notificationsContent.bellLabel(unread)}
      className={cn(
        "relative flex h-11 w-11 shrink-0 items-center justify-center",
        tone === "onLime"
          ? "rounded-2xl bg-lime-foreground/10 text-lime-foreground transition-transform duration-100 active:scale-[0.97] motion-reduce:active:scale-100"
          : "rounded-md bg-secondary text-secondary-foreground active:bg-secondary/70",
      )}
    >
      <Bell className="h-5 w-5" />
      {badge && (
        <span
          aria-hidden
          className={cn(
            "absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-whatsapp px-1 text-[11px] font-semibold leading-none text-white",
            tone === "onLime" && "ring-2 ring-lime",
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
