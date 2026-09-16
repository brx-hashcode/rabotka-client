/**
 * Every string on the identity-check request page.
 *
 * The person is deciding whether Rabotka may tell a company that the details
 * it holds match. What that does and does not reveal is the whole decision, so
 * it is said plainly and in one place.
 */
export const identityCheckContent = {
  title: "Demande de vérification d'identité",
  subtitle: (appName: string) =>
    `${appName} demande à Rabotka de confirmer votre identité`,
  loading: "Chargement…",

  claimed: {
    heading: "Ce que cette entreprise nous a indiqué :",
    name: "Nom",
    country: "Pays",
    city: "Ville",
    document: "Pièce d'identité",
    erased: "Ces informations ont été effacées.",
  },

  willShare: {
    heading: "Si vous acceptez, Rabotka indiquera seulement :",
    items: [
      "si ces informations correspondent à votre compte Rabotka vérifié ;",
      "si notre équipe a vérifié votre identité, et depuis quand.",
    ],
    never:
      "Aucun document, aucune photo et aucune information de votre compte ne sera transmis.",
  },

  approve: "Accepter",
  decline: "Refuser",
  notMe:
    "Vous ne reconnaissez pas cette demande ? Refusez-la : l'entreprise ne saura pas si vous avez refusé ou simplement pas répondu.",
  expiresAt: (when: string) => `Cette demande expire le ${when}.`,

  outcome: {
    approved: {
      title: "Demande acceptée",
      body: (appName: string) =>
        `Rabotka a transmis le résultat de la vérification à ${appName}.`,
    },
    declined: {
      title: "Demande refusée",
      body: (appName: string) => `Aucune information n'a été transmise à ${appName}.`,
    },
    expired: {
      title: "Demande expirée",
      body: (appName: string) =>
        `Cette demande n'est plus valable. Aucune information n'a été transmise à ${appName}.`,
    },
  },

  backHome: "Retour à l'accueil",
  canClose: "Vous pouvez fermer cette page.",

  errors: {
    notFound:
      "Cette demande est introuvable. Vérifiez que vous êtes connecté avec le compte qui l'a reçue.",
    decision: "Votre réponse n'a pas pu être enregistrée. Réessayez.",
    network: "Connexion impossible. Vérifiez votre réseau et réessayez.",
    retry: "Réessayer",
  },

  documentTypes: {
    IDENTITY_CARD: "Carte d'identité",
    PASSPORT: "Passeport",
    DRIVER_LICENSE: "Permis de conduire",
    NIU_CARD: "Carte NIU",
  },
} as const;
