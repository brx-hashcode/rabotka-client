import type { FooterLinkGroup } from "@/types";

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
    { label: "Politique de confidentialité", href: "/terms" },
    { label: "Conditions d'utilisation", href: "/terms" },
    { label: "Politique des cookies", href: "/terms" },
  ],
} as const;

export const footerContent = {
  brandDescription:
    "Connecter les travailleurs informels et les employeurs grâce à WhatsApp. Simple, accessible, sans application.",
  socialLinks: [
    { label: "LinkedIn", href: "https://www.linkedin.com/company/rabotka" },
    { label: "Facebook", href: "https://www.facebook.com/share/18pxQBc8nD" },
    {
      label: "Instagram",
      href: "https://www.instagram.com/rabotka__",
    },
  ],
} as const;
