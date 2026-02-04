import {
  Header,
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
  Footer,
  ScrollToTop,
} from "@/features/landing/components";

export default function Index() {
  return (
    <div className="min-h-screen bg-background w-full">
      <Header />
      <main className="w-full">
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
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
