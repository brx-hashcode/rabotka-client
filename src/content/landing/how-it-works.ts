import { UserPlus, ShieldCheck, Link, MessageCircle, Unlock } from "lucide-react";
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
          "Renseignez vos informations personnelles, choisissez Travailleur et ajoutez pièce d'identité + selfie. Vous recevez un crédit de bienvenue à l'inscription.",
      },
      {
        icon: ShieldCheck,
        title: "Vérification d'identité (KYC)",
        description: "Nous vérifions votre identité pour la confiance",
      },
      {
        icon: Link,
        title: "Activez votre accès WhatsApp",
        description:
          "Une fois votre identité vérifiée, vous recevez un message WhatsApp de bienvenue. Tapez Menu pour accéder à toutes les fonctionnalités du bot.",
      },
      {
        icon: MessageCircle,
        title: "Postulez aux offres d'emploi",
        description:
          "Recevez des offres correspondant à votre profil et postulez directement via le chat WhatsApp",
      },
      {
        icon: Unlock,
        title: "Débloquez le contact de l'employeur",
        description:
          "Si votre candidature est acceptée, déverrouillez les coordonnées de l'employeur — gratuit avec votre crédit de bienvenue",
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
          "Renseignez vos informations personnelles, choisissez Employeur et ajoutez pièce d'identité + selfie. Vous recevez un crédit de bienvenue à l'inscription.",
      },
      {
        icon: ShieldCheck,
        title: "Vérification d'identité (KYC)",
        description: "Nous vérifions votre identité pour la sécurité",
      },
      {
        icon: Link,
        title: "Activez votre accès WhatsApp",
        description:
          "Une fois votre identité vérifiée, vous recevez un message WhatsApp de bienvenue. Tapez Menu pour accéder à toutes les fonctionnalités de l'assistant.",
      },
      {
        icon: MessageCircle,
        title: "Consultez les candidatures",
        description:
          "Recevez et examinez les candidatures de travailleurs vérifiés, puis acceptez le meilleur profil",
      },
      {
        icon: Unlock,
        title: "Débloquez le contact du travailleur",
        description:
          "Après avoir accepté une candidature, déverrouillez les coordonnées du travailleur — gratuit avec votre crédit de bienvenue",
      },
    ] as Step[],
  },
} as const;
