export const confirmationContent = {
  pageTitle: "Récapitulatif",
  personalInfo: {
    title: "Informations personnelles",
    fields: {
      firstName: "Prénom",
      lastName: "Nom",
      email: "Email",
      phone: "Numéro WhatsApp",
      country: "Pays",
      city: "Ville",
      address: "Adresse",
      description: "Description",
      profileType: "Type de profil",
      category: "Domaine d'activité",
      documentType: "Type de document",
    },
    defaultDescription: "Aucune description",
  },
  kycDocuments: {
    title: "Documents KYC",
    documentIdentity: "Document d'identité — recto",
    documentIdentityBack: "Document d'identité — verso",
    selfie: "Selfie",
    noDocument: "Aucun document",
    noSelfie: "Aucun selfie",
    // Shown when the file is uploaded but this tab no longer holds a local
    // copy to preview — after a reload that emptied IndexedDB. The document is
    // there and the signup will go through; only the thumbnail is missing.
    uploadedNoPreview: "Document téléversé — aperçu indisponible",
  },
  profileTypes: {
    worker: "Travailleur",
    employer: "Recruteur",
  },
  buttons: {
    back: "Retour",
    confirm: "Confirmer",
    submitting: "Envoi en cours...",
  },
  policyCheckbox: {
    label: "J'ai lu et j'accepte les conditions d'utilisation et la politique de confidentialité de la plateforme.",
    helper: "Vous devez accepter les conditions pour continuer.",
  },
  referral: {
    question: "Avez-vous été parrainé ?",
    // "Non" is the honest default: most people arrive without a code, and a
    // prefilled field would invite them to invent one.
    hint: "Si quelqu'un vous a invité sur Rabotka, saisissez son code.",
    yes: "Oui",
    no: "Non",
    inputLabel: "Code de parrainage",
    placeholder: "Ex. K7M2XQ",
    invalid: "Le code doit comporter 6 caractères (chiffres et lettres).",
    checking: "Vérification...",
    // Filled with the parrain's first name and last initial.
    found: (name: string) => `Parrainé par ${name}`,
    notFound:
      "Ce code est introuvable. Vous pouvez continuer sans, votre inscription n'est pas bloquée.",
    linkPrefilled: "Code appliqué depuis votre lien d'invitation.",
  },
} as const;
