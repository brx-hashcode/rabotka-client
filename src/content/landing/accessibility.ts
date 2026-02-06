import { Wifi, Sparkles, Globe } from "lucide-react";
import type { Feature } from "@/types";

export const accessibilityContent = {
  badge: "Conçu pour l'Afrique",
  title: "Simple. Abordable. Accessible.",
  description:
    "Conçu pour la vraie vie, pas pour la théorie. Rabotka fonctionne comme vous travaillez.",
  features: [
    {
      icon: Wifi,
      title: "Fonctionne avec peu d'internet",
      description: "Optimisé pour les connexions lentes",
    },
    {
      icon: Sparkles,
      title: "Aucune compétence technique requise",
      description: "Simple et intuitif pour tous",
    },
    {
      icon: Globe,
      title: "Adapté aux langues locales",
      description: "Communiquez dans votre langue",
    },
  ] as Feature[],
} as const;
