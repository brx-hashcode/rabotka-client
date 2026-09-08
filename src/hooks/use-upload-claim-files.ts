import { useMutation } from "@tanstack/react-query";
import { uploadClaimAttachments } from "@/lib/api/claims-controller";
import { useToast } from "@/hooks/use-toast";

export const useUploadClaimFiles = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (files: File[]) => uploadClaimAttachments(files),
    onError: () => {
      toast({
        title: "Envoi impossible",
        description: "Les images n'ont pas pu être envoyées. Réessayez.",
        variant: "destructive",
      });
    },
  });
};
