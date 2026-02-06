import { MessageCircle } from "lucide-react";
import type { HeroContent } from "@/types";

export const heroContent: HeroContent = {
  badge: {
    icon: MessageCircle,
    text: "Plateforme d'emploi via WhatsApp",
  },
  title: {
    main: "Trouvez du travail. Trouvez de l'aide.",
    highlight: "Directement sur WhatsApp.",
    rest: "",
  },
  description:
    "Rabotka connecte les travailleurs informels et les employeurs grâce à un assistant WhatsApp simple — sans application, sans complexité.",
  cta: {
    primary: "Trouver un emploi",
    secondary: "Trouver un travailleur",
  },
  stats: [
    {
      label: "Gratuit",
      value: "",
    },
    {
      label: "Pas d'appli à télécharger",
      value: "",
    },
    {
      label: "Profils vérifiés",
      value: "",
    },
  ],
  floatingCard: {
    title: "Rabotka Bot",
    subtitle:
      "Bonjour ! J'ai trouvé 3 opportunités d'emploi près de chez vous. Voulez-vous les voir ?",
    icon: MessageCircle,
  },
  imageAlt: "Femme africaine utilisant WhatsApp dans un marché vibrant",
} as const;
