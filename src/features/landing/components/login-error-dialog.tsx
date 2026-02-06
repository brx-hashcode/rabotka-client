import { XCircle } from "lucide-react";
import { useCallback, useMemo } from "react";
import { StatusModal } from "@/features/onboarding/components/status-modal";
import { loginContent } from "@/content/landing/login";

type LoginErrorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorMessage?: string;
  onRetry: () => void;
};

export function LoginErrorDialog({
  open,
  onOpenChange,
  errorMessage,
  onRetry,
}: Readonly<LoginErrorDialogProps>) {
  const handleRetry = useCallback(() => {
    onOpenChange(false);
    onRetry();
  }, [onOpenChange, onRetry]);

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
      title={loginContent.error.title}
      description={errorMessage || "Une erreur s'est produite lors de la connexion"}
      buttonText={loginContent.error.button}
      onButtonClick={handleRetry}
      buttonClassName="w-full bg-red-500 hover:bg-red-600 text-white"
    />
  );
}
