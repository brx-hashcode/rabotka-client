export type OnboardingProfileTypeParam = "WORKER" | "EMPLOYER";

const ONBOARDING_PATH = "/onboarding";

export function onboardingPathWithProfile(
  profileType: OnboardingProfileTypeParam,
): string {
  const params = new URLSearchParams({ profileType });
  return `${ONBOARDING_PATH}?${params.toString()}`;
}
