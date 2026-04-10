import type { FooterLinkGroup, ContactInfo } from "@/types";

export const footerLinks: FooterLinkGroup = {
  Produit: [
    { label: "Comment ça marche", href: "#how-it-works" },
    { label: "Trouver un emploi", href: "/onboarding?profileType=WORKER" },
    {
      label: "Trouver un travailleur",
      href: "/onboarding?profileType=EMPLOYER",
    },
    { label: "Profils vérifiés", href: "#trust" },
  ],
  Entreprise: [
    { label: "À propos", href: "#about" },
    { label: "Carrières", href: "/" },
    { label: "Presse", href: "/" },
    { label: "Blog", href: "/" },
  ],
  Légal: [
    // Until dedicated pages/endpoints exist, route to Terms.
    { label: "Politique de confidentialité", href: "/terms" },
    { label: "Conditions d'utilisation", href: "/terms" },
    { label: "Politique des cookies", href: "/terms" },
  ],
} as const;

export const contactInfo: ContactInfo = {
  address: "Brazzaville, République du Congo",
  email: "contact@rabotka.africa",
  phone: "+242 06 000 0000",
} as const;

export const footerContent = {
  brandDescription:
    "Connecter les travailleurs informels et les employeurs grâce à WhatsApp. Simple, accessible, sans application.",
  socialLinks: [
    { label: "Twitter", href: "https://twitter.com/Rabotka" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/rabotka" },
    { label: "Facebook", href: "https://www.facebook.com/rabotka" },
    { label: "Instagram", href: "https://www.instagram.com/rabotka" },
  ],
} as const;
