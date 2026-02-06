import { Button } from "@/components/ui/button";
import { headerContent } from "@/content/landing/header";
import { User } from "lucide-react";
import { useState } from "react";
import { LoginDialog } from "@/features/landing/components/login-dialog";

export const LoginButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="whatsapp"
        size="default"
        onClick={() => setIsDialogOpen(true)}
      >
        <User className="w-4 h-4" />
        {headerContent.cta.button}
      </Button>

      <LoginDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
    </>
  );
};
