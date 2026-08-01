import type { LucideIcon } from "lucide-react";
import {
  Home,
  AlertCircle,
  User,
  Briefcase,
  Clock,
  Inbox,
  ClipboardList,
} from "lucide-react";
import type { ProfileMeResponse } from "@/lib/api/profile-controller";

export type NavTab = {
  readonly to: string;
  readonly label: string;
  readonly icon: LucideIcon;
};

export const WORKER_TABS: readonly NavTab[] = [
  { to: "/home", label: "Accueil", icon: Home },
  { to: "/mes-candidatures", label: "Candidatures", icon: ClipboardList },
  { to: "/applications", label: "Missions", icon: Clock },
  { to: "/claims", label: "Réclamations", icon: AlertCircle },
  { to: "/profile", label: "Profil", icon: User },
];

export const EMPLOYER_TABS: readonly NavTab[] = [
  { to: "/home", label: "Accueil", icon: Home },
  { to: "/jobs", label: "Mes offres", icon: Briefcase },
  { to: "/candidatures", label: "Candidatures", icon: Inbox },
  { to: "/missions", label: "Missions", icon: Clock },
  { to: "/profile", label: "Profil", icon: User },
];

export function getTabsForProfileType(
  profileType: ProfileMeResponse["profileType"] | undefined,
): readonly NavTab[] {
  return profileType === "EMPLOYER" ? EMPLOYER_TABS : WORKER_TABS;
}
