import { useMutation } from "@tanstack/react-query";
import { uploadKycFile } from "@/lib/api/profile-controller";

/**
 * Uploads a single KYC file (document or selfie) to storage during onboarding
 * step 3 and returns its public URL. The URL is stored and sent at profile
 * creation, so the final create call carries no file bytes.
 */
export function useUploadKycFile() {
  return useMutation({
    mutationKey: ["profile", "kyc-upload"],
    mutationFn: (file: File) => uploadKycFile(file),
  });
}
