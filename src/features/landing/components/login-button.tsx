import { Button } from "@/components/ui/button";
import { headerContent } from "@/content/landing/header";
import { User } from "lucide-react";
import { useNavigate } from "react-router";
import { useProfileMe } from "@/hooks/use-profile-me";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { config, whatsappLink } from "@/config";

export const LoginButton = () => {
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
        className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <Avatar className="h-10 w-10 border-2 border-primary cursor-pointer hover:opacity-80 transition-opacity">
          <AvatarImage
            src={profile.avatarUrl ?? undefined}
            alt={fullName}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary text-primary-foreground font-medium">
            {initials || <User className="h-5 w-5" />}
          </AvatarFallback>
        </Avatar>
      </button>
    );
  }

  return (
    <Button variant="whatsapp" size="default" asChild>
      <a
        href={whatsappLink(config.whatsapp.messages.start)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {headerContent.cta.button}
      </a>
    </Button>
  );
};
