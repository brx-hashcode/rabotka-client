import { UserPlus, ShieldCheck, Link, MessageCircle } from "lucide-react";
import type { Step } from "@/types";

export const howItWorksContent = {
  worker: {
    subtitle: "Pour les Travailleurs",
    title: "Comment ça marche pour les travailleurs",
    steps: [
      {
        icon: UserPlus,
        title: "Créez votre profil",
        description:
          "Renseignez vos informations personnelles, choisissez Travailleur et ajoutez pièce d'identité + selfie",
      },
      {
        icon: ShieldCheck,
        title: "Vérification d'identité (KYC)",
        description: "Nous vérifions votre identité pour la confiance",
      },
      {
        icon: Link,
        title: "Rejoignez Rabotka sur WhatsApp",
        description:
          "Recevez un lien envoyé sur votre téléphone pour vous connecter à notre bot",
      },
      {
        icon: MessageCircle,
        title: "Recevez des opportunités d'emploi",
        description: "Recevez des offres correspondantes directement par chat",
      },
    ] as Step[],
  },

  employer: {
    subtitle: "Pour les Employeurs",
    title: "Comment ça marche pour les employeurs",
    steps: [
      {
        icon: UserPlus,
        title: "Créez votre profil",
        description:
          "Renseignez vos informations personnelles, choisissez Employeur et ajoutez pièce d'identité + selfie",
      },
      {
        icon: ShieldCheck,
        title: "Vérification d'identité (KYC)",
        description: "Nous vérifions votre identité pour la sécurité",
      },
      {
        icon: Link,
        title: "Rejoignez Rabotka sur WhatsApp",
        description:
          "Recevez un lien envoyé sur votre téléphone pour vous connecter à notre assistant",
      },
      {
        icon: MessageCircle,
        title: "Recevez des profils correspondants",
        description:
          "Contactez les travailleurs directement via WhatsApp ou téléphone",
      },
    ] as Step[],
  },
} as const;
