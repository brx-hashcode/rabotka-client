import { Button } from "@/components/ui/button";
import { headerContent } from "@/content/landing/header";
import { User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { LoginDialog } from "@/features/landing/components/login-dialog";
import { useProfileMe } from "@/hooks/use-profile-me";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const MobileLoginButton = () => {
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
        className="w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <div className="flex items-center gap-3 px-4 py-2 bg-whatsapp text-white rounded-lg hover:opacity-90 transition-opacity">
          <Avatar className="h-8 w-8 border-2 border-white">
            <AvatarImage
              src={profile.avatarUrl ?? undefined}
              alt={fullName}
              className="object-cover"
            />
            <AvatarFallback className="bg-white text-whatsapp font-medium text-sm">
              {initials || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">
            {headerContent.cta.profile}
          </span>
        </div>
      </button>
    );
  }

  return (
    <>
      <Button
        type="button"
        size="default"
        variant="whatsapp"
        className="w-full"
        onClick={() => setIsDialogOpen(true)}
      >
        <User className="w-4 h-4" />
        {headerContent.cta.button}
      </Button>

      <LoginDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
    </>
  );
};
