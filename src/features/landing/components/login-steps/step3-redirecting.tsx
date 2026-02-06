import { Loader } from "lucide-react";
import { loginContent } from "@/content/landing/login";

export const Step3Redirecting = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <Loader className="size-10 animate-spin text-whatsapp " />
      <p className="text-sm text-muted-foreground">
        {loginContent.step3.redirecting}
      </p>
    </div>
  );
};
