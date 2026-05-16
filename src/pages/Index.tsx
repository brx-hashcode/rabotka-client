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

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Rabotka",
  url: "https://rabotka.work",
  logo: "https://rabotka.work/og-image.png",
  description:
    "Rabotka connecte les travailleurs informels et les employeurs grâce à un assistant WhatsApp simple en Afrique centrale.",
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
  name: "Rabotka",
  url: "https://rabotka.work",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://rabotka.work/onboarding",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Comment fonctionne Rabotka?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Rabotka connecte les travailleurs et les employeurs via WhatsApp. Les travailleurs créent un profil vérifié et postuulent aux offres d'emploi. Les employeurs publient des offres et acceptent les candidatures. Tout se fait via WhatsApp, sans besoin d'application supplémentaire.",
      },
    },
    {
      "@type": "Question",
      name: "Rabotka est-il gratuit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "L'inscription est gratuite, et chaque nouveau membre reçoit un crédit de bienvenue suffisant pour débloquer un premier contact sans rien payer. Par la suite, débloquer les coordonnées d'un contact nécessite un petit frais, payable via wallet ou Mobile Money.",
      },
    },
    {
      "@type": "Question",
      name: "Comment puis-je vérifier mon profil?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pour vérifier votre profil, vous devez fournir une pièce d'identité valide et une photo de vous-même (selfie). Notre équipe examine chaque demande de vérification pour garantir la sécurité et la confiance sur la plateforme.",
      },
    },
  ],
};

export default function Index() {
  return (
    <>
      <Seo
        canonical="/"
        jsonLd={[organizationSchema, websiteSchema, faqSchema]}
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
