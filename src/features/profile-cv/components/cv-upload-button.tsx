import { useRef } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useUploadProfileCv } from "@/hooks/use-profile-cv";
import { CV_ACCEPT, cvFileProblem } from "@/lib/profile-cv";
import { cn } from "@/lib/utils";

/** Picks a PDF or Word file and puts it on the profile as « Mon CV ». */
export function CvUploadButton({
  label = "Ajouter mon CV",
  variant = "default",
  className,
  onUploaded,
}: Readonly<{
  label?: string;
  variant?: "default" | "outline";
  className?: string;
  onUploaded?: () => void;
}>) {
  const input = useRef<HTMLInputElement>(null);
  const upload = useUploadProfileCv();

  return (
    <>
      <input
        ref={input}
        type="file"
        accept={CV_ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          // Cleared so picking the same file again still fires a change.
          e.target.value = "";
          if (!file) return;
          const problem = cvFileProblem(file);
          if (problem) {
            toast.error(problem);
            return;
          }
          upload.mutate(file, { onSuccess: () => onUploaded?.() });
        }}
      />
      <Button
        type="button"
        variant={variant}
        disabled={upload.isPending}
        onClick={() => input.current?.click()}
        className={cn(
          variant === "default" &&
            "bg-whatsapp text-white hover:bg-whatsapp active:bg-whatsapp-dark",
          className,
        )}
      >
        {upload.isPending ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <Upload className="mr-2 size-4" />
        )}
        {upload.isPending ? "Envoi du CV…" : label}
      </Button>
    </>
  );
}
