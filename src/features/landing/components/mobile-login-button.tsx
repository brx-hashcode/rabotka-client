import { Button } from "@/components/ui/button";
import { headerContent } from "@/content/landing/header";
import { User } from "lucide-react";
import { useNavigate } from "react-router";
import { useProfileMe } from "@/hooks/use-profile-me";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const MobileLoginButton = () => {
  const { data: profile, isLoading } = useProfileMe();
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />;
  }

  if (profile) {
    const fullName = `${profile.firstName} ${profile.lastName}`;
    const initials =
      `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`.toUpperCase();

    return (
      <button
        type="button"
        onClick={() => navigate("/profile")}
        className="w-fit md:hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <Avatar className="h-8 w-8 border-2 border-whatsapp">
          <AvatarImage
            src={profile.avatarUrl ?? undefined}
            alt={fullName}
            className="object-cover"
          />
          <AvatarFallback className="bg-white text-whatsapp font-medium text-sm">
            {initials || <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
      </button>
    );
  }

  return (
    <Button
      type="button"
      size="default"
      variant="whatsapp"
      className="w-fit shadow-none"
      onClick={() => navigate("/login")}
    >
      {headerContent.cta.button}
    </Button>
  );
};
