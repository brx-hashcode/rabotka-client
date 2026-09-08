import { BookOpen, LifeBuoy, Lock, Search } from "lucide-react";

/**
 * The assistant, described only in terms of what it actually does.
 *
 * **Kept short on purpose.** The first draft gave each point a three-line
 * paragraph, and four of those stacked in identical cards read as filler — the
 * reader skims the bold line and skips the grey block underneath, so the words
 * were paying no rent. A claim that needs a paragraph to land is usually a
 * claim that is not confident.
 *
 * **Grouped, because the four points were never parallel.** Two describe a
 * capability and two describe a limit, and a flat list of four asked the reader
 * to work that out for themselves. Naming the two halves does the work instead,
 * and it puts the limits on the page as deliberately as the abilities — for an
 * assistant attached to somebody's money and identity, "it does not act on your
 * behalf" is a feature, not a disclaimer.
 *
 * What this must never say, whatever the length:
 *
 * - **No amounts, no fees, no percentages.** They are set at runtime and read
 *   from a tool at the moment of answering; a number printed here is wrong the
 *   day somebody changes it.
 * - **No local languages.** French and English. Nothing else exists.
 * - **Nothing about finding or pushing missions into the chat.** It explains
 *   and it looks things up; browsing happens in the app.
 * - **Nothing about acting on your behalf.** There is no tool that writes.
 */
export const vovaContent = {
  badge: "VoVa AI",
  title: "Posez la question. Il répond.",
  description:
    "VoVa AI est l'assistant de Rabotka, dans la conversation WhatsApp que vous avez déjà. Pas de formulaire, pas d'attente.",
  groups: [
    {
      label: "Ce qu'il fait",
      points: [
        {
          icon: BookOpen,
          title: "Il explique",
          description: "Vérification, déblocage, pénalités, évaluations.",
        },
        {
          icon: Search,
          title: "Il consulte",
          description: "Votre solde, vos candidatures, vos pénalités.",
        },
      ],
    },
    {
      label: "Ce qu'il ne fait pas",
      points: [
        {
          icon: Lock,
          title: "Il ne touche à rien",
          description: "Tout ce qui engage se confirme dans l'application.",
        },
        {
          icon: LifeBuoy,
          title: "Il ne devine pas",
          description: "Sans la réponse, il vous oriente vers l'équipe.",
        },
      ],
    },
  ],
} as const;
