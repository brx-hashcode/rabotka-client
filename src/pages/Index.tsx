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
} from '@/features/landing/components';

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden w-full">
      <Header />
      <main className="overflow-x-hidden w-full">
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
};

export default Index;
