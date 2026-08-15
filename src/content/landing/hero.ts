import { MessageCircle } from "lucide-react";
import type { HeroContent } from "@/types";

export const heroContent: HeroContent = {
  badge: {
    icon: MessageCircle,
    text: "Plateforme de missions via WhatsApp",
  },
  title: {
    main: "Trouvez une mission. Trouvez de l'aide.",
    highlight: "Directement sur WhatsApp.",
    rest: "",
  },
  description:
    "Rabotka connecte les travailleurs informels et les recruteurs grâce à un assistant WhatsApp simple sans application, sans complexité.",
  cta: {
    primary: "Trouver une mission",
    secondary: "Trouver un travailleur",
  },
  stats: [
    {
      label: "1er contact couvert",
      value: "",
    },
    {
      label: "Pas d'appli à télécharger",
      value: "",
    },
    {
      label: "Profils vérifiés et notés",
      value: "",
    },
  ],
  floatingCard: {
    title: "Rabotka Bot",
    subtitle:
      "Bonjour ! J'ai trouvé 3 missions près de chez vous. Voulez-vous les voir ?",
    icon: MessageCircle,
  },
  imageAlt: "Femme africaine utilisant WhatsApp dans un marché vibrant",
} as const;
