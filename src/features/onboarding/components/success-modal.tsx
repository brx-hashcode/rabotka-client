import { useNavigate } from "react-router";
import { CheckCircle } from "lucide-react";
import { useCallback, useMemo } from "react";
import { StatusModal } from "./status-modal";

type SuccessModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SuccessModal({
  open,
  onOpenChange,
}: Readonly<SuccessModalProps>) {
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    onOpenChange(false);
    navigate("/");
  }, [onOpenChange, navigate]);

  const icon = useMemo(
    () => (
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle className="h-10 w-10 text-green-500" />
      </div>
    ),
    []
  );

  return (
    <StatusModal
      open={open}
      onOpenChange={onOpenChange}
      icon={icon}
      title="Votre profil a bien été créé avec succès"
      description="Vous allez recevoir un lien sur WhatsApp afin de finaliser la création de votre profil et vérification"
      buttonText="J'ai compris"
      onButtonClick={handleClose}
      buttonClassName="w-full bg-green-500 hover:bg-green-600 text-white"
    />
  );
}
