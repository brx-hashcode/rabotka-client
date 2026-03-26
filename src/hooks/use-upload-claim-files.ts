import { useMutation } from "@tanstack/react-query";
import { uploadFiles } from "@/lib/api/claims-controller";
import { useToast } from "@/hooks/use-toast";

export const useUploadClaimFiles = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (files: File[]) => uploadFiles(files),
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      });
    },
  });
};
