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
  steps: ({
    referrerAmount,
    refereeAmount,
    minQualifyingAmount,
    isPercentage,
  }: {
    referrerAmount: string;
    refereeAmount: string;
    /**
     * Omitted when there is no threshold to state: an older backend during a
     * rolling deploy, or a percentage configuration, where a share fits inside
     * any payment and nothing can be too small. The sentence drops the clause
     * rather than rendering the word "undefined" at the user, which is what a
     * bare interpolation does.
     */
    minQualifyingAmount: string | null;
    /**
     * Changes what the amounts are OF, not just how they read. A percentage is
     * meaningless without naming the thing it is a share of, so these are
     * different sentences rather than the same sentence with a different unit.
     */
    isPercentage: boolean;
  }) => {
    // The minimum is stated, not implied. In FIXED mode the payout can never
    // exceed the payment that triggered it, so a filleul whose first mise en
    // relation costs less than the two credits combined earns nobody anything —
    // announcing the amount without the condition is how you promise a credit
    // that never arrives.
    //
    // In PERCENTAGE mode that cannot happen: a share always fits inside the
    // payment. There is no condition to state, and stating one would invent a
    // restriction that does not exist.
    let creditBody: string;
    if (isPercentage) {
      creditBody = `${referrerAmount} du montant de sa première mise en relation payée par mobile money sont versés sur votre portefeuille.`;
    } else if (minQualifyingAmount) {
      creditBody = `${referrerAmount} sont versés sur votre portefeuille dès sa première mise en relation payée par mobile money, à partir de ${minQualifyingAmount}.`;
    } else {
      creditBody = `${referrerAmount} sont versés sur votre portefeuille dès sa première mise en relation payée par mobile money.`;
    }

    return [
      {
        title: "Partagez votre code",
        body: "Envoyez-le à une personne de confiance qui cherche du travail ou qui recrute.",
      },
      {
        title: "Elle s'inscrit avec votre code",
        body: isPercentage
          ? `Elle le saisit à la fin de son inscription. Elle recevra ${refereeAmount} de sa première mise en relation en crédit.`
          : `Elle le saisit à la fin de son inscription et reçoit ${refereeAmount} de crédit.`,
      },
      {
        title: "Vous recevez votre crédit",
        body: creditBody,
      },
    ];
  },
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
