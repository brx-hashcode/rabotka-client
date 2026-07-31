import { NavLink } from "react-router";
import { useProfileMe } from "@/hooks/use-profile-me";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTabsForProfileType } from "../config/tabs";

export function BottomNav() {
  const { data: profile } = useProfileMe();
  const tabs = getTabsForProfileType(profile?.profileType);

  const initials =
    `${profile?.firstName?.[0] ?? ""}${profile?.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-border bg-background pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex items-stretch">
        {tabs.map(({ to, label, icon: Icon }) => {
          const isProfile = to === "/profile";
          return (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center gap-1 py-2 transition-colors",
                    isActive
                      ? "text-whatsapp"
                      : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                {({ isActive }) =>
                  isProfile ? (
                    <>
                      <Avatar
                        className={cn(
                          "h-5 w-5",
                          isActive && "ring-2 ring-whatsapp ring-offset-1",
                        )}
                      >
                        {profile?.avatarUrl && (
                          <AvatarImage
                            src={profile.avatarUrl}
                            alt={label}
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback className="bg-muted text-[9px] font-medium text-muted-foreground">
                          {initials || <User className="h-3 w-3" />}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[11px] font-medium leading-none">
                        {label}
                      </span>
                    </>
                  ) : (
                    <>
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="text-[11px] font-medium leading-none">
                        {label}
                      </span>
                    </>
                  )
                }
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
