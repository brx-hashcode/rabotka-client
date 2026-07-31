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
  FAQSection,
  CTASection,
} from "@/features/landing/components";
import { Seo } from "@/hooks/use-seo";
import {
  howToWorkerSchema,
  howToEmployerSchema,
} from "@/content/landing/how-it-works";
import { faqSchema } from "@/content/landing/faq";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://rabotka.work/#organization",
  name: "Rabotka",
  url: "https://rabotka.work",
  logo: {
    "@type": "ImageObject",
    url: "https://rabotka.work/rabotka-logo.png",
    width: 512,
    height: 512,
    caption: "Rabotka",
  },
  image: "https://rabotka.work/rabotka-logo.png",
  description:
    "Rabotka connecte les travailleurs informels et les recruteurs grâce à un assistant WhatsApp simple en Afrique centrale.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Brazzaville",
    addressCountry: "CG",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "contact@rabotka.africa",
  },
  sameAs: [
    "https://twitter.com/Rabotka",
    "https://www.linkedin.com/company/rabotka",
    "https://www.facebook.com/rabotka",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://rabotka.work/#website",
  name: "Rabotka",
  url: "https://rabotka.work",
  publisher: { "@id": "https://rabotka.work/#organization" },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://rabotka.work/?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function Index() {
  return (
    <>
      <Seo
        canonical="/"
        jsonLd={[
          organizationSchema,
          websiteSchema,
          faqSchema,
          howToWorkerSchema,
          howToEmployerSchema,
        ]}
      />
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
      <FAQSection />
      <CTASection />
    </>
  );
}
