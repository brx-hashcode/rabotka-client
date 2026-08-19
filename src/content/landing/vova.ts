/**
 * The assistant, described only in terms of what it actually does.
 *
 * **Kept short on purpose.** The first draft gave each point a three-line
 * paragraph, and four of those stacked in identical cards read as filler — the
 * reader skims the bold line and skips the grey block underneath, so the words
 * were paying no rent. A claim that needs a paragraph to land is usually a
 * claim that is not confident.
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
  points: [
    {
      title: "Il explique",
      description: "Vérification, déblocage, pénalités, évaluations.",
    },
    {
      title: "Il consulte",
      description: "Votre solde, vos candidatures, vos pénalités.",
    },
    {
      title: "Il ne touche à rien",
      description: "Tout ce qui engage se confirme dans l'application.",
    },
    {
      title: "Il ne devine pas",
      description: "Sans la réponse, il vous oriente vers l'équipe.",
    },
  ],
} as const;
