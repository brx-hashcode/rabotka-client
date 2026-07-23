import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  listPortfolio,
  createPortfolioItem,
  updatePortfolioItem,
  removePortfolioItem,
  addPortfolioImages,
  removePortfolioImage,
  type PortfolioItem,
  type UpdatePortfolioItemPayload,
} from "@/lib/api/portfolio-controller";

const PORTFOLIO_KEY = ["profile", "portfolio"];

export function usePortfolio(enabled = true) {
  return useQuery<PortfolioItem[]>({
    queryKey: PORTFOLIO_KEY,
    queryFn: listPortfolio,
    enabled,
    retry: false,
  });
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function useCreatePortfolioItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: { title: string; description: string; images: File[] }) =>
      createPortfolioItem(data.title, data.description, data.images),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PORTFOLIO_KEY,
        refetchType: "all",
      });
      toast({ description: "Réalisation ajoutée." });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: errorMessage(error, "Échec de l'ajout de la réalisation."),
      });
    },
  });
}

export function useUpdatePortfolioItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: { id: string; payload: UpdatePortfolioItemPayload }) =>
      updatePortfolioItem(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PORTFOLIO_KEY,
        refetchType: "all",
      });
      toast({ description: "Réalisation mise à jour." });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: errorMessage(error, "Échec de la mise à jour."),
      });
    },
  });
}

export function useDeletePortfolioItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => removePortfolioItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PORTFOLIO_KEY,
        refetchType: "all",
      });
      toast({ description: "Réalisation supprimée." });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: errorMessage(error, "Échec de la suppression."),
      });
    },
  });
}

export function useAddPortfolioImages() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: { id: string; images: File[] }) =>
      addPortfolioImages(data.id, data.images),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PORTFOLIO_KEY,
        refetchType: "all",
      });
      toast({ description: "Images ajoutées." });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: errorMessage(error, "Échec de l'ajout des images."),
      });
    },
  });
}

export function useRemovePortfolioImage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: { id: string; imageId: string }) =>
      removePortfolioImage(data.id, data.imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PORTFOLIO_KEY,
        refetchType: "all",
      });
      toast({ description: "Image supprimée." });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: errorMessage(error, "Échec de la suppression de l'image."),
      });
    },
  });
}
