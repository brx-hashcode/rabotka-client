import { useNavigate } from "react-router";
import { XCircle } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useCallback, useMemo } from "react";
import { StatusModal } from "./status-modal";

type ErrorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ErrorModal({ open, onOpenChange }: Readonly<ErrorModalProps>) {
  const navigate = useNavigate();
  const error = useOnboardingStore((state) => state.error);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    navigate("/onboarding?step=personal-informations");
  }, [onOpenChange, navigate]);

  const icon = useMemo(
    () => (
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
        <XCircle className="h-10 w-10 text-red-500" />
      </div>
    ),
    []
  );

  return (
    <StatusModal
      open={open}
      onOpenChange={onOpenChange}
      icon={icon}
      title="Une erreur s'est produite lors de la création de votre profil"
      description={
        error || "Une erreur technique est survenue. Veuillez réessayer"
      }
      buttonText="Réessayer"
      onButtonClick={handleClose}
    />
  );
}
