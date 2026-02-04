import { useMutation } from "@tanstack/react-query";
import { useOnboardingStore } from "@/stores/onboardingStore";

interface OnboardingResponse {
  success: boolean;
  userId?: string;
  error?: string;
}

const API_ENDPOINT = "/api/onboarding";

export function useOnboardingMutation() {
  return useMutation({
    mutationFn: async (): Promise<OnboardingResponse> => {
      const { personalInfo, kycData } = useOnboardingStore.getState();

      if (!kycData.kycDocument || !kycData.kycSelfie) {
        throw new Error("Les documents KYC sont requis");
      }

      const formData = new FormData();
      formData.append("firstName", personalInfo.firstName);
      formData.append("lastName", personalInfo.lastName);
      formData.append("email", personalInfo.email);
      formData.append("phone", personalInfo.phone);
      formData.append("address", personalInfo.address);
      formData.append("description", personalInfo.description);
      formData.append("profileType", kycData.profileType);
      formData.append("kycDocument", kycData.kycDocument);
      formData.append("kycSelfie", kycData.kycSelfie);

      console.log({
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        email: personalInfo.email,
        phone: personalInfo.phone,
        address: personalInfo.address,
        description: personalInfo.description,
        profileType: kycData.profileType,
        kycDocument: kycData.kycDocument,
        kycSelfie: kycData.kycSelfie,
      });

      return;

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "Une erreur technique est survenue. Veuillez réessayer",
        }));
        throw new Error(errorData.error || "Erreur lors de la soumission");
      }

      return await response.json();
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
