import { useMutation } from "@tanstack/react-query";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { apiErrors } from "@/content/onboarding";
import { requiresBackSide } from "@/lib/kyc-document-types";
import {
  createProfile,
  type CreateProfileResponse,
} from "@/lib/api/profile-controller";

export function useOnboardingMutation() {
  return useMutation({
    mutationKey: ["onboarding-mutation"],
    mutationFn: async (): Promise<CreateProfileResponse> => {
      const { personalInfo, kycData, referralCode, referralSource } =
        useOnboardingStore.getState();

      const needsBack = requiresBackSide(kycData.documentType);

      if (
        !kycData.kycDocumentUrl ||
        !kycData.kycSelfieUrl ||
        (needsBack && !kycData.kycDocumentBackUrl)
      ) {
        throw new Error(apiErrors.kycDocumentsRequired);
      }

      return await createProfile({
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        email: personalInfo.email,
        phone: personalInfo.phone,
        countryCode: personalInfo.countryCode,
        countryName: personalInfo.countryName,
        city: personalInfo.city,
        address: personalInfo.address,
        description: personalInfo.description,
        profileType: kycData.profileType,
        categoryIds: kycData.categoryIds.length > 0 ? kycData.categoryIds : undefined,
        documentType: kycData.documentType,
        kycDocumentUrl: kycData.kycDocumentUrl,
        kycDocumentKey: kycData.kycDocumentKey ?? undefined,
        // Send the back only when the type has one, so a stale upload left over
        // from a type the user switched away from never reaches the backend.
        // The key follows the same rule — sending one without its url would
        // persist a pointer to a document the profile does not claim to have.
        kycDocumentBackUrl: needsBack
          ? (kycData.kycDocumentBackUrl ?? undefined)
          : undefined,
        kycDocumentBackKey: needsBack
          ? (kycData.kycDocumentBackKey ?? undefined)
          : undefined,
        kycSelfieUrl: kycData.kycSelfieUrl,
        kycSelfieKey: kycData.kycSelfieKey ?? undefined,
        readAndApprovedPolicies: true,
        // Same rule as the document back above: send it only when there is one.
        // An empty string would pass a code the user never gave, and record a
        // source for it.
        referralCode: referralCode || undefined,
        referralSource: referralCode ? referralSource : undefined,
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
