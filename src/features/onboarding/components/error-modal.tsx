import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboardingStore";

interface ErrorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ErrorModal({ open, onOpenChange }: ErrorModalProps) {
  const navigate = useNavigate();
  const error = useOnboardingStore((state) => state.error);

  const handleClose = () => {
    onOpenChange(false);
    navigate("/onboarding?step=personal-informations");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <DialogTitle className="text-center text-xl">
              Une erreur s'est produite lors de la création de votre profil
            </DialogTitle>
            <DialogDescription className="text-center">
              {error || "Une erreur technique est survenue. Veuillez réessayer"}
            </DialogDescription>
            <p className="text-xs text-gray-500">verif. profil</p>
          </div>
        </DialogHeader>
        <div className="pt-4">
          <Button
            onClick={handleClose}
            className="w-full bg-black hover:bg-gray-800 text-white"
          >
            Réessayer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
