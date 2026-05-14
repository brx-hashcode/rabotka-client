import { useState } from "react";
import { useNavigate } from "react-router";
import { Seo } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import { AvatarUpload } from "@/features/profile/components/avatar-upload";
import { useProfileMe } from "@/hooks/use-profile-me";

export default function OnboardingAvatar() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfileMe();
  const [uploaded, setUploaded] = useState(false);

  const goToProfile = () => navigate("/profile");

  if (isLoading || profile?.avatarUrl) return null;

  return (
    <>
      <Seo title="Photo de profil - Rabotka" noIndex />
      <div className="min-h-dvh flex flex-col bg-background">
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6">
          <AvatarUpload
            defaultAvatar={profile?.avatarUrl}
            onAvatarChange={() => setUploaded(true)}
          />
          <h1 className="text-2xl font-bold text-foreground mt-6 mb-1">
            Photo de profil
          </h1>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Ajoutez une photo pour vous identifier. Vous pouvez le faire plus
            tard depuis votre profil.
          </p>
        </div>

        <div className="px-6 pb-10 w-full max-w-sm mx-auto flex flex-col gap-3">
          <Button
            variant={uploaded ? "default" : "outline"}
            onClick={goToProfile}
          >
            {uploaded ? "Continuer" : "Passer cette étape"}
          </Button>
        </div>
      </div>
    </>
  );
}
