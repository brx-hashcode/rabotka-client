import type { FooterLinkGroup, ContactInfo } from "@/types";

export const footerLinks: FooterLinkGroup = {
  Produit: [
    "Comment ça marche",
    "Trouver un emploi",
    "Trouver un travailleur",
    "Profils vérifiés",
  ],
  Entreprise: ["À propos", "Carrières", "Presse", "Blog"],
  Légal: [
    "Politique de confidentialité",
    "Conditions d'utilisation",
    "Politique des cookies",
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
  socialLinks: ["Twitter", "LinkedIn", "Facebook", "Instagram"],
} as const;
