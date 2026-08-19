import { Bot, UserCheck, MessageSquare, Phone } from "lucide-react";
import type { Feature } from "@/types";

export const whatIsRabotkaContent = {
  badge: "Qu'est-ce que Rabotka",
  // "Assistant" belongs to VoVa now, not to the platform.
  //
  // This section called Rabotka "un assistant intelligent" while the section
  // below introduces VoVa AI as the assistant — two of them, a few hundred
  // pixels apart, for a reader meeting the product for the first time.
  title: "La marketplace des missions du quotidien",
  description:
    "Rabotka connecte les travailleurs aux opportunités et les recruteurs à une aide de confiance, le tout via WhatsApp.",
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
