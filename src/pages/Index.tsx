import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import RealitySection from "@/components/landing/RealitySection";
import WhyWhatsAppSection from "@/components/landing/WhyWhatsAppSection";
import WhatIsRabotkaSection from "@/components/landing/WhatIsRabotkaSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import DirectContactSection from "@/components/landing/DirectContactSection";
import TrustSection from "@/components/landing/TrustSection";
import AccessibilitySection from "@/components/landing/AccessibilitySection";
import ImpactSection from "@/components/landing/ImpactSection";
import VisionSection from "@/components/landing/VisionSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

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
