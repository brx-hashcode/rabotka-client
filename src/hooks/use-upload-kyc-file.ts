import { useMutation } from "@tanstack/react-query";
import { uploadKycFile } from "@/lib/api/profile-controller";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { isSignupVerificationError } from "@/lib/signup-verification";

/**
 * Uploads a single KYC file (document or selfie) to storage during onboarding
 * step 3 and returns its public URL. The URL is stored and sent at profile
 * creation, so the final create call carries no file bytes.
 *
 * Carries the token from the phone verification. When the API no longer
 * accepts it (expired, spent), the verification is dropped, which sends the
 * person back to step 1 to verify their number again.
 */
export function useUploadKycFile() {
  return useMutation({
    mutationKey: ["profile", "kyc-upload"],
    mutationFn: (file: File) =>
      uploadKycFile(
        file,
        useOnboardingStore.getState().signupVerification?.token ?? "",
      ),
    onError: (error) => {
      if (isSignupVerificationError(error)) {
        useOnboardingStore.getState().setSignupVerification(null);
      }
    },
  });
}
