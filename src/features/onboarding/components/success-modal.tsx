import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface SuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SuccessModal({ open, onOpenChange }: SuccessModalProps) {
  const navigate = useNavigate();

  const handleClose = () => {
    onOpenChange(false);
    navigate("/");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <DialogTitle className="text-center text-xl">
              Votre profil a bien été créé avec succès
            </DialogTitle>
            <DialogDescription className="text-center">
              Vous allez recevoir un lien sur WhatsApp afin de finaliser la
              création de votre profil et vérification
            </DialogDescription>
            <p className="text-xs text-gray-500">verif. profil</p>
          </div>
        </DialogHeader>
        <div className="pt-4">
          <Button
            onClick={handleClose}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            J'ai compris
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
