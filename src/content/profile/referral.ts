export const referralContent = {
  button: "Parrainage",
  yourCode: "Votre code de parrainage",
  tapToCopy: "Touchez pour copier",
  copied: "Code copié",
  copyLink: "Copier le lien",
  linkCopied: "Lien copié",
  // One action. navigator.share opens the OS sheet, where WhatsApp is already
  // the first target on the phones this runs on — naming WhatsApp on the button
  // would promise a destination the sheet lets the user override anyway.
  share: "Partager mon code",
  sheet: {
    title: "Parrainez vos proches",
    description:
      "Invitez des personnes de confiance et recevez un crédit quand elles utilisent Rabotka.",
  },
  /**
   * Three steps instead of one sentence.
   *
   * The condition — that the credit lands only after the filleul really pays —
   * is the part that generates support messages when it is buried. As step 3 of
   * a sequence it reads as how it works; as a footnote under the reward it
   * reads as a catch.
   *
   * Amounts are interpolated from the server: an admin changes them in les
   * paramètres and this text follows without a déploiement.
   */
  steps: (
    referrerAmount: string,
    refereeAmount: string,
    /**
     * Omitted when the API did not send a threshold — an older backend during a
     * rolling deploy. The sentence drops the clause rather than rendering the
     * word "undefined" at the user, which is what a bare interpolation does.
     */
    minQualifyingAmount: string | null,
  ) => [
    {
      title: "Partagez votre code",
      body: "Envoyez-le à une personne de confiance qui cherche du travail ou qui recrute.",
    },
    {
      title: "Elle s'inscrit avec votre code",
      body: `Elle le saisit à la fin de son inscription et reçoit ${refereeAmount} de crédit.`,
    },
    {
      // The minimum is stated, not implied. The payout can never exceed the
      // payment that triggered it, so a filleul whose first mise en relation
      // costs less than the two credits combined earns nobody anything —
      // announcing the amount without the condition is how you promise a credit
      // that never arrives.
      title: "Vous recevez votre crédit",
      body: minQualifyingAmount
        ? `${referrerAmount} sont versés sur votre portefeuille dès sa première mise en relation payée par mobile money, à partir de ${minQualifyingAmount}.`
        : `${referrerAmount} sont versés sur votre portefeuille dès sa première mise en relation payée par mobile money.`,
    },
  ],
  stats: {
    title: "Vos parrainages",
    joined: "Inscrits",
    rewarded: "Crédités",
    earned: "Gagné",
  },
  /** Shown instead of a row of zeros before the first parrainage. */
  emptyState: "Personne n'a encore utilisé votre code.",
  shareMessage: (link: string) =>
    `Rejoignez-moi sur Rabotka pour trouver du travail ou recruter près de chez vous : ${link}`,
} as const;
