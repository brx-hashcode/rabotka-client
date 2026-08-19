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
  // Names the assistant, and says something it actually says.
  //
  // This used to read « J'ai trouvé 3 missions près de chez vous » — a
  // behaviour VoVa does not have: it explains and it looks things up, while
  // browsing happens in the application. Copy that promises more than the
  // product delivers is the first thing a new user discovers is untrue.
  floatingCard: {
    title: "VoVa AI",
    subtitle:
      "Bonjour ! Je suis VoVa AI, l'assistant de Rabotka. Vous cherchez une mission, ou quelqu'un pour en réaliser une ?",
    icon: MessageCircle,
  },
  imageAlt: "Femme africaine utilisant WhatsApp dans un marché vibrant",
} as const;
