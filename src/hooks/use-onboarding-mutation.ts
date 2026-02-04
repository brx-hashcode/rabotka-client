import { useMutation } from "@tanstack/react-query";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { apiErrors } from "@/content/onboarding";
import {
  createProfile,
  type CreateProfilePayload,
  type OnboardingResponse,
} from "@/lib/api/index-controller";

export function useOnboardingMutation() {
  return useMutation({
    mutationKey: ["onboarding-mutation"],
    mutationFn: async (): Promise<OnboardingResponse> => {
      const { personalInfo, kycData } = useOnboardingStore.getState();

      if (!kycData.kycDocument || !kycData.kycSelfie) {
        throw new Error(apiErrors.kycDocumentsRequired);
      }

      if (!kycData.profileType) {
        throw new Error(apiErrors.kycDocumentsRequired);
      }

      const payload: CreateProfilePayload = {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        email: personalInfo.email,
        phone: personalInfo.phone,
        address: personalInfo.address,
        description: personalInfo.description,
        profileType: kycData.profileType.toUpperCase() as "WORKER" | "EMPLOYER",
        kycDocument: kycData.kycDocument,
        kycSelfie: kycData.kycSelfie,
      };

      return await createProfile(payload);
    },
    onMutate: () => {
      const { setIsSubmitting, setError } = useOnboardingStore.getState();
      setIsSubmitting(true);
      setError(null);
    },
    onSuccess: (data: OnboardingResponse) => {
      const { resetStore, setIsSubmitting } = useOnboardingStore.getState();
      resetStore();
      setIsSubmitting(false);
    },
    onError: (error: Error) => {
      const { setError, setIsSubmitting } = useOnboardingStore.getState();
      setError(error.message);
      setIsSubmitting(false);
    },
  });
}
