import { useMutation } from "@tanstack/react-query";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { apiErrors } from "@/content/onboarding";
import {
  createProfile,
  type CreateProfileResponse,
} from "@/lib/api/profile-controller";

export function useOnboardingMutation() {
  return useMutation({
    mutationKey: ["onboarding-mutation"],
    mutationFn: async (): Promise<CreateProfileResponse> => {
      const { personalInfo, kycData } = useOnboardingStore.getState();

      if (!kycData.kycDocument || !kycData.kycSelfie) {
        throw new Error(apiErrors.kycDocumentsRequired);
      }

      return await createProfile({
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        email: personalInfo.email,
        phone: personalInfo.phone,
        address: personalInfo.address,
        description: personalInfo.description,
        profileType: kycData.profileType,
        categoryId: kycData.categoryId || undefined,
        documentType: kycData.documentType,
        kycDocument: kycData.kycDocument,
        kycSelfie: kycData.kycSelfie,
        readAndApprovedPolicies: true,
      });
    },
    onMutate: () => {
      const { setIsSubmitting, setError } = useOnboardingStore.getState();
      setIsSubmitting(true);
      setError(null);
    },
    onSuccess: () => {
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
