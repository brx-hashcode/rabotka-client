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
        description: "Ajoutez vos compétences, expérience et localisation",
      },
      {
        icon: ShieldCheck,
        title: "Vérification du profil",
        description: "Nous vérifions votre identité pour la confiance",
      },
      {
        icon: Link,
        title: "Rejoignez Rabotka sur WhatsApp",
        description: "Recevez un lien pour vous connecter à notre bot",
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
        title: "Soumettez votre besoin",
        description: "Aide ménagère, répétiteur, coiffeur, et plus encore",
      },
      {
        icon: ShieldCheck,
        title: "Vérification",
        description: "Nous vérifions votre demande pour la sécurité",
      },
      {
        icon: Link,
        title: "Rejoignez Rabotka sur WhatsApp",
        description: "Connectez-vous à notre assistant",
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
