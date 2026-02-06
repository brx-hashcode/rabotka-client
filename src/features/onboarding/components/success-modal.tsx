import { useNavigate } from "react-router";
import { CheckCircle } from "lucide-react";
import { useCallback, useMemo } from "react";
import { StatusModal } from "./status-modal";
import { modalsContent } from "@/content/onboarding";

type SuccessModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email?: string;
};

export function SuccessModal({
  open,
  onOpenChange,
  email,
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
    [],
  );

  const description = useMemo(() => {
    const emailAddress = email || "";
    const emailMessage = modalsContent.success.emailSent.replace(
      "{profile_email}",
      emailAddress || "votre adresse email",
    );
    return `${emailMessage}\n\n${modalsContent.success.whatsappMessage}`;
  }, [email]);

  return (
    <StatusModal
      open={open}
      onOpenChange={handleClose}
      icon={icon}
      title={modalsContent.success.title}
      description={description}
      buttonText={modalsContent.success.button}
      onButtonClick={handleClose}
      buttonClassName="w-full bg-green-500 hover:bg-green-600 text-white"
    />
  );
}
