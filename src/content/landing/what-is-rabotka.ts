import { Bot, UserCheck, MessageSquare, Phone } from "lucide-react";
import type { Feature } from "@/types";

export const whatIsRabotkaContent = {
  badge: "Qu'est-ce que Rabotka",
  title: "Votre assistant emploi personnel",
  description:
    "Rabotka est un assistant intelligent qui connecte les travailleurs aux opportunités et les employeurs à une aide de confiance, le tout via WhatsApp.",
  features: [
    {
      icon: UserCheck,
      title: "Crée des profils de travailleurs",
      description: "Construisez votre identité professionnelle",
    },
    {
      icon: Bot,
      title: "Associe emplois et compétences",
      description: "Matching intelligent par IA",
    },
    {
      icon: MessageSquare,
      title: "Suggère des profils de confiance",
      description: "Recommandations vérifiées",
    },
    {
      icon: Phone,
      title: "Permet le contact direct",
      description:
        "Déblocage simple après acceptation , premier contact offert",
    },
  ] as Feature[],
} as const;
