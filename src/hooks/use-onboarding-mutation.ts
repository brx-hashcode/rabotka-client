import { useMutation } from "@tanstack/react-query";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { apiErrors } from "@/content/onboarding";

type OnboardingResponse = {
  success: boolean;
  userId?: string;
  error?: string;
};

const API_ENDPOINT =
  "https://webhook.site/06016fdc-252a-411c-ab4f-709fb461c22a";

export function useOnboardingMutation() {
  return useMutation({
    mutationKey: ["onboarding-mutation"],
    mutationFn: async (): Promise<OnboardingResponse> => {
      const { personalInfo, kycData } = useOnboardingStore.getState();

      if (!kycData.kycDocument || !kycData.kycSelfie) {
        throw new Error(apiErrors.kycDocumentsRequired);
      }

      const formData = new FormData();
      formData.append("firstName", personalInfo.firstName);
      formData.append("lastName", personalInfo.lastName);
      formData.append("email", personalInfo.email);
      formData.append("phone", personalInfo.phone);
      formData.append("address", personalInfo.address);
      formData.append("description", personalInfo.description);
      formData.append(
        "profileType",
        kycData.profileType.toUpperCase() as "WORKER" | "EMPLOYER"
      );
      formData.append("kycDocument", kycData.kycDocument);
      formData.append("kycSelfie", kycData.kycSelfie);

      await new Promise((resolve) => setTimeout(resolve, 5000));

      return;

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: apiErrors.technicalError,
        }));
        throw new Error(errorData.error || apiErrors.submissionError);
      }

      return await response.json();
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
