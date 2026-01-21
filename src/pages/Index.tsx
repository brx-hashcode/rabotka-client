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
} from '@/features/landing/components';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <RealitySection />
        <WhyWhatsAppSection />
        <WhatIsRabotkaSection />
        <section id="how-it-works">
          <HowItWorksSection />
        </section>
        <DirectContactSection />
        <section id="trust">
          <TrustSection />
        </section>
        <AccessibilitySection />
        <ImpactSection />
        <section id="about">
          <VisionSection />
        </section>
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
