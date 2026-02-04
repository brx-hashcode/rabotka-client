import {
  HeroSection,
  RealitySection,
  WhyWhatsAppSection,
  WhatIsRabotkaSection,
  HowItWorksSection,
  DirectContactSection,
  TrustSection,
  AccessibilitySection,
  ImpactSection,
  VisionSection,
  CTASection,
} from "@/features/landing/components";
import { LandingLayout } from "@/features/landing/layouts";

export default function Index() {
  return (
    <LandingLayout>
      <HeroSection />
      <RealitySection />
      <WhyWhatsAppSection />
      <WhatIsRabotkaSection />
      <HowItWorksSection />
      <DirectContactSection />
      <TrustSection />
      <AccessibilitySection />
      <ImpactSection />
      <VisionSection />
      <CTASection />
    </LandingLayout>
  );
}
