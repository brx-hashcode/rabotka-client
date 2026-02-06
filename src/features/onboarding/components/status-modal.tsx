import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

type StatusModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  buttonClassName?: string;
};

export function StatusModal({
  open,
  onOpenChange,
  icon,
  title,
  description,
  buttonText,
  onButtonClick,
  buttonClassName = "w-full bg-black hover:bg-gray-800 text-white",
}: Readonly<StatusModalProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {icon}
            <DialogTitle className="text-center text-xl">{title}</DialogTitle>
            <DialogDescription className="text-center whitespace-pre-line">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="pt-4">
          <Button onClick={onButtonClick} className={buttonClassName}>
            {buttonText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
