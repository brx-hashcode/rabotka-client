export const discussionsContent = {
  list: {
    title: "Discussion",
    emptyTitle: "Aucune discussion",
    emptyDescription:
      "Vos échanges avec les employeurs et les travailleurs apparaîtront ici.",
    closed: "Discussion close",
  },
  thread: {
    unlockCta: "Débloquer les coordonnées",
    unlocked: "Coordonnées débloquées",
    placeholder: "Écrivez votre message…",
    send: "Envoyer",
    closed: "Cette discussion est close, vous ne pouvez plus écrire.",
    empty: "Écrivez le premier message.",
  },

  /**
   * The standing rule, said before it is enforced.
   *
   * Three placements, three different jobs — and none of them is decoration.
   * Somebody whose number vanishes without warning concludes the app is broken
   * and tries another way, which is to say learns to evade. And the day a
   * repeated attempt turns into a report, the only question that matters is
   * whether the person knew.
   *
   * Each one names the way to get contact details rather than only forbidding
   * the other: a warning that says only "interdit" throws half its value away.
   */
  warning: {
    /** Permanent, in the thread header. Known before the first attempt. */
    header:
      "Vos coordonnées restent protégées. N’envoyez jamais votre numéro ou votre email ici : ils sont automatiquement masqués. Pour les échanger, utilisez « Débloquer les coordonnées ».",
    /** Under a withheld fragment. The moment the rule is understood. */
    sender:
      "Ce fragment n’a pas été transmis. Les coordonnées ne s’échangent pas dans la discussion.",
    /** Once per thread, under the first hole. Not a bug, a rule. */
    recipient:
      "Les coordonnées sont masquées tant qu’elles n’ont pas été débloquées.",
    /** A message withheld whole. */
    held: "Ce message n’a pas été transmis : il contenait des coordonnées.",
    reportCta: "Signaler une erreur",
    reportDone: "Merci, votre signalement a été enregistré.",
  },
};
