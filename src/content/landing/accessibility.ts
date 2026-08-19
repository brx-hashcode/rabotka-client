import { Wifi, Globe, MousePointerClick } from "lucide-react";
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
      icon: MousePointerClick,
      title: "Aucune compétence technique requise",
      description: "Simple et intuitif pour tous",
    },
    {
      // Was « Adapté aux langues locales / Communiquez dans votre langue ».
      // No local language exists anywhere in the product: the application is in
      // French and the assistant answers in French or English. A promise the
      // product cannot keep costs more than the one it replaces.
      icon: Globe,
      title: "En français et en anglais",
      description: "L'assistant vous répond dans la langue que vous écrivez",
    },
  ] as Feature[],
} as const;
