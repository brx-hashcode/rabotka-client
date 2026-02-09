import { Button } from "@/components/ui/button";
import { headerContent } from "@/content/landing/header";
import { User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { LoginDialog } from "@/features/landing/components/login-dialog";
import { useProfileMe } from "@/hooks/use-profile-me";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const LoginButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
          <AvatarImage src={profile.avatarUrl ?? undefined} alt={fullName} />
          <AvatarFallback className="bg-primary text-primary-foreground font-medium">
            {initials || <User className="h-5 w-5" />}
          </AvatarFallback>
        </Avatar>
      </button>
    );
  }

  return (
    <>
      <Button
        variant="whatsapp"
        size="default"
        onClick={() => setIsDialogOpen(true)}
      >
        <User className="w-4 h-4" />
        {headerContent.cta.button}
      </Button>

      <LoginDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
    </>
  );
};
