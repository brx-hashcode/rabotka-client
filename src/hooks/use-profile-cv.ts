import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getProfileCv,
  removeProfileCv,
  setCvPreference,
  uploadProfileCv,
  type CvChoice,
  type ProfileCv,
} from "@/lib/api/profile-cv-controller";

export const PROFILE_CV_KEY = ["profile-cv"] as const;

export function useProfileCv(enabled = true) {
  return useQuery({
    queryKey: PROFILE_CV_KEY,
    queryFn: getProfileCv,
    enabled,
    staleTime: 60_000,
  });
}

function useCvMutation<A>(fn: (arg: A) => Promise<ProfileCv>, success?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (cv) => {
      qc.setQueryData(PROFILE_CV_KEY, cv);
      if (success) toast.success(success);
    },
    onError: (err: Error) =>
      toast.error(err.message || "Une erreur est survenue, réessayez."),
  });
}

export const useUploadProfileCv = () =>
  useCvMutation((file: File) => uploadProfileCv(file), "CV ajouté à votre profil.");

export const useRemoveProfileCv = () =>
  useCvMutation<void>(() => removeProfileCv(), "CV retiré de votre profil.");

export const useSetCvPreference = () =>
  useCvMutation((preferred: CvChoice) => setCvPreference(preferred));
