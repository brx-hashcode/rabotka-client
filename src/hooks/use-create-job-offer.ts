import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createJobOffer,
  type CreateJobOfferPayload,
} from "@/lib/api/job-offer-controller";
import { useToast } from "@/hooks/use-toast";

export const useCreateJobOffer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateJobOfferPayload) => createJobOffer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employer", "job-offers"],
        refetchType: "all",
      });
      toast({ description: "Votre offre a été publiée." });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description:
          error instanceof Error && error.message
            ? error.message
            : "Échec de la publication de l'offre.",
      });
    },
  });
};
