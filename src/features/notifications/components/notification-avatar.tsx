import {
  Bell,
  Briefcase,
  CheckCircle2,
  MessageSquare,
  Star,
  Unlock,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AppNotification } from "@/lib/api/notification-controller";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  JOB_RECOMMENDATION: Briefcase,
  APPLICATION_ACCEPTED: Briefcase,
  APPLICATION_REJECTED: Briefcase,
  HIRE_CANCELLED: Briefcase,
  NEW_APPLICATION: Briefcase,
  APPLICATION_CANCELLED: Briefcase,
  MISSION_COMPLETED: Briefcase,
  MISSION_RATED: Star,
  CONTACT_UNLOCKED: Unlock,
  PAYMENT_SUCCEEDED: CheckCircle2,
  PAYMENT_FAILED: XCircle,
  CLAIM_COMMENTED: MessageSquare,
  CLAIM_STATUS_CHANGED: MessageSquare,
};

/**
 * Tints by meaning, as in the agent app's bell: work (offers, applications,
 * missions) on the brand lime, money green or red, ratings and claims amber.
 */
const TONES: Record<string, string> = {
  PAYMENT_SUCCEEDED: "bg-whatsapp/15 text-whatsapp-dark",
  CONTACT_UNLOCKED: "bg-whatsapp/15 text-whatsapp-dark",
  PAYMENT_FAILED: "bg-destructive/10 text-destructive",
  APPLICATION_REJECTED: "bg-destructive/10 text-destructive",
  HIRE_CANCELLED: "bg-destructive/10 text-destructive",
  APPLICATION_CANCELLED: "bg-destructive/10 text-destructive",
  MISSION_RATED: "bg-amber-100 text-amber-700",
  CLAIM_COMMENTED: "bg-amber-100 text-amber-700",
  CLAIM_STATUS_CHANGED: "bg-amber-100 text-amber-700",
};

/**
 * The card's leading visual: the photo of whoever caused the notification, or
 * an icon for its type.
 *
 * The fallback is the type icon, never initials — on a profile view the photo
 * is the only trace of the employer the worker is allowed, and initials would
 * start to name them.
 */
export function NotificationAvatar({
  notification,
}: Readonly<{ notification: AppNotification }>) {
  const Icon = ICONS[notification.type] ?? Bell;
  const tone = TONES[notification.type] ?? "bg-lime text-lime-foreground";

  const icon = (
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl",
        tone,
      )}
    >
      <Icon className="size-5" />
    </span>
  );

  if (!notification.actorAvatarUrl) return icon;

  return (
    <Avatar className="size-10">
      {/* Decorative: the sentence beside it says what happened. */}
      <AvatarImage src={notification.actorAvatarUrl} alt="" />
      <AvatarFallback className="bg-transparent p-0">{icon}</AvatarFallback>
    </Avatar>
  );
}
