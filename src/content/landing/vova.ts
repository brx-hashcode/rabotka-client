import { MessagesSquare, Wallet, ShieldCheck, HelpCircle } from "lucide-react";
import type { Feature } from "@/types";

/**
 * The assistant, described only in terms of what it actually does.
 *
 * Every line here maps to something that exists in the backend, and the list of
 * what it must NOT say is as load-bearing as the copy itself:
 *
 * - **No amounts, no fees, no percentages.** This page describes the model
 *   qualitatively; the assistant reads figures from a tool at the moment it
 *   answers, and they are set by an administrator at runtime. A number printed
 *   here would be wrong the day someone changes it.
 * - **No local languages.** VoVa answers in French and English. Nothing else
 *   exists.
 * - **Nothing about finding or pushing missions into the chat.** It explains
 *   and it looks things up; browsing happens in the app. The hero card used to
 *   promise the opposite.
 * - **Nothing about acting on your behalf.** There is no tool that writes, by
 *   design, and that is the point of the third card below.
 */
export const vovaContent = {
  badge: "VoVa AI",
  title: "Un assistant qui répond, dans la conversation",
  description:
    "VoVa AI est l'assistant de Rabotka. Il répond à vos questions directement sur WhatsApp, dans la même conversation que le reste — sans formulaire, sans attente, à toute heure.",
  features: [
    {
      icon: HelpCircle,
      title: "Il explique comment Rabotka fonctionne",
      description:
        "La vérification, le déblocage de contact, les pénalités, les évaluations : posez la question comme elle vous vient, il répond avec vos mots.",
    },
    {
      icon: Wallet,
      title: "Il consulte vos informations",
      description:
        "Votre solde, vos candidatures, vos pénalités, l'état d'un déblocage : il va chercher l'information réelle au moment où vous la demandez.",
    },
    {
      icon: ShieldCheck,
      title: "Il ne modifie jamais rien",
      description:
        "VoVa ne publie pas, ne paie pas, ne postule pas et n'annule pas à votre place. Tout ce qui engage quelque chose se fait dans l'application, où vous voyez ce que vous confirmez.",
    },
    {
      icon: MessagesSquare,
      title: "Il préfère dire qu'il ne sait pas",
      description:
        "Ses réponses viennent de la documentation Rabotka. Quand elle ne contient pas la réponse, il vous le dit et vous oriente vers l'équipe plutôt que d'inventer.",
    },
  ] as Feature[],
} as const;
