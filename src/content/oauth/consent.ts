/**
 * Every string on the consent screen.
 *
 * This screen is where a user decides to hand their identity and their KYC
 * status to a company that is not Rabotka. The wording is the whole of the
 * informed part of informed consent, so it lives in one file that can be read
 * end to end and reviewed as a piece — not scattered across five components.
 */
export const consentContent = {
  loading: "Chargement…",

  header: {
    title: "Se connecter avec Rabotka",
    /**
     * "pour continuer vers X", not "X souhaite accéder à votre compte".
     *
     * The second reads as though the application gains standing access to the
     * account, which is false — it receives a one-off copy of a few fields. The
     * first says the true thing and is also what every user has already learned
     * to parse from the equivalent Google screen.
     */
    continueTo: (appName: string) => `pour continuer vers ${appName}`,
  },

  phone: {
    title: "Connexion avec Rabotka",
    description:
      "Entrez votre numéro de téléphone. Nous vous enverrons un code sur WhatsApp.",
  },

  otp: {
    description:
      "Entrez le code à 6 chiffres que nous venons de vous envoyer sur WhatsApp.",
  },

  noAccount: {
    title: "Aucun compte Rabotka",
    description:
      "Ce numéro n'est associé à aucun compte Rabotka. Créez votre compte, puis revenez pour vous connecter.",
    createButton: "Créer un compte Rabotka",
    retryButton: "Essayer un autre numéro",
  },

  consent: {
    willReceive: "L'application recevra :",
    approve: "Autoriser",
    deny: "Refuser",
    // Said plainly because it is the part users most often get wrong about
    // these screens: this is a one-time handover, not a standing connection.
    footnote:
      "Vous pourrez retirer cette autorisation à tout moment depuis votre compte Rabotka.",
    notYou: "Ce n'est pas vous ?",
    switchAccount: "Changer de compte",
  },

  /**
   * One line per scope, phrased as what the application receives.
   *
   * Deliberately concrete rather than categorical — "Votre numéro de téléphone"
   * beats "Coordonnées", because a user cannot consent to a category. The
   * `openid` scope has no line: it carries only an opaque identifier that means
   * nothing outside this pairing, and listing it would pad the screen with
   * something nobody can act on.
   */
  scopes: {
    profile: {
      label: "Votre nom et votre photo de profil",
      detail: "Prénom, nom et photo.",
    },
    phone: {
      label: "Votre numéro de téléphone",
      detail: "Confirmé à l'instant par le code WhatsApp.",
    },
    email: {
      label: "Votre adresse e-mail",
      detail: "Non vérifiée par Rabotka.",
    },
    "rabotka:verification": {
      label: "Votre statut de vérification Rabotka",
      // The second clause is the reassurance that matters and is easy to lose:
      // the application learns the verdict, never the documents behind it.
      detail: "Le résultat seul. Vos documents ne quittent jamais Rabotka.",
    },
    "rabotka:location": {
      label: "Votre ville et votre pays",
      detail: "Sans adresse précise.",
    },
  } as const,

  footer: {
    // Sits under every step. The user is about to hand personal data to a
    // company that is not Rabotka, so the way out has to be permanently
    // visible rather than buried on the last screen.
    privacy: "Confidentialité",
    terms: "Conditions",
  },

  errors: {
    title: "Connexion impossible",
    expired:
      "Cette demande de connexion a expiré. Relancez la connexion depuis l'application.",
    generic: "Une erreur est survenue. Relancez la connexion depuis l'application.",
    unknownApp:
      "Cette application n'est pas autorisée à utiliser « Connexion avec Rabotka ».",
    accountUnavailable:
      "Ce compte ne peut pas être utilisé pour se connecter à une application partenaire.",
  },
} as const;

export type ConsentScopeKey = keyof typeof consentContent.scopes;
