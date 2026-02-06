import { CheckCircle } from "lucide-react";
import { useCallback, useMemo } from "react";
import { StatusModal } from "@/features/onboarding/components/status-modal";
import { loginContent } from "@/content/landing/login";

type LoginSuccessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LoginSuccessDialog({
  open,
  onOpenChange,
}: Readonly<LoginSuccessDialogProps>) {
  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

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
      title={loginContent.success.title}
      description={loginContent.success.description}
      buttonText={loginContent.success.button}
      onButtonClick={handleClose}
      buttonClassName="w-full bg-green-500 hover:bg-green-600 text-white"
    />
  );
}
