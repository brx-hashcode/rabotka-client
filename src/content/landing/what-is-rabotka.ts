import { Bot, UserCheck, MessageSquare, Phone } from "lucide-react";
import type { Feature } from "@/types";

export const whatIsRabotkaContent = {
  badge: "Qu'est-ce que Rabotka",
  title: "Votre assistant missions personnel",
  description:
    "Rabotka est un assistant intelligent qui connecte les travailleurs aux opportunités et les recruteurs à une aide de confiance, le tout via WhatsApp.",
  features: [
    {
      icon: UserCheck,
      title: "Crée des profils de travailleurs",
      description: "Construisez votre identité professionnelle",
    },
    {
      icon: Bot,
      title: "Associe missions et compétences",
      description: "Matching intelligent par IA",
    },
    {
      icon: MessageSquare,
      title: "Suggère des profils de confiance",
      description: "Recommandations vérifiées, présentées en cartes WhatsApp",
    },
    {
      icon: Phone,
      title: "Permet le contact direct",
      description:
        "Déblocage mutuel après acceptation, premier contact couvert par votre crédit de bienvenue",
    },
  ] as Feature[],
} as const;
