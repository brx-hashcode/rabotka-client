import type { FooterLinkGroup } from "@/types";

export const footerLinks: FooterLinkGroup = {
  Produit: [
    { label: "Comment ça marche", href: "#how-it-works" },
    { label: "Trouver une mission", href: "/onboarding?profileType=WORKER" },
    {
      label: "Trouver un travailleur",
      href: "/onboarding?profileType=EMPLOYER",
    },
    { label: "Profils vérifiés", href: "#trust" },
    // The integration guide for "Connexion avec Rabotka". Under Produit rather
    // than Entreprise: it is a thing another company can build on, not a page
    // about us. The API's discovery document names this URL as
    // `service_documentation`, so the path is fixed by the protocol — see
    // oauth-discovery.controller.ts before changing it.
    { label: "Développeur", href: "/developers/login-with-rabotka" },
  ],
  Entreprise: [
    { label: "À propos", href: "#about" },
    { label: "Carrières", href: "/", disabled: true },
    { label: "Presse", href: "/", disabled: true },
    { label: "Blog", href: "/", disabled: true },
  ],
  Légal: [
    { label: "Politique de confidentialité", href: "/privacy" },
    { label: "Conditions d'utilisation", href: "/terms" },
    { label: "Politique des cookies", href: "/cookies" },
  ],
} as const;

export const footerContent = {
  brandDescription:
    "Connecter les travailleurs informels et les recruteurs grâce à WhatsApp. Simple, accessible, sans application.",
  socialLinks: [
    { label: "LinkedIn", href: "https://www.linkedin.com/company/rabotka" },
    { label: "Facebook", href: "https://www.facebook.com/share/18pxQBc8nD" },
    {
      label: "Instagram",
      href: "https://www.instagram.com/rabotka__",
    },
  ],
} as const;
