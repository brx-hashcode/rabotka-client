export const confirmationContent = {
  pageTitle: "Récapitulatif",
  personalInfo: {
    title: "Informations personnelles",
    fields: {
      firstName: "Prénom",
      lastName: "Nom",
      email: "Email",
      phone: "Téléphone",
      address: "Adresse",
      description: "Description",
      profileType: "Type de profil",
      documentType: "Type de document",
    },
    defaultDescription: "Aucune description",
  },
  kycDocuments: {
    title: "Documents KYC",
    documentIdentity: "Document d'identité",
    selfie: "Selfie",
    noDocument: "Aucun document",
    noSelfie: "Aucun selfie",
  },
  profileTypes: {
    worker: "Travailleur",
    employer: "Employeur",
  },
  documentTypes: {
    identityCard: "Carte d'identité",
    passport: "Passeport",
    driverLicense: "Permis de conduire",
  },
  buttons: {
    back: "Retour",
    confirm: "Confirmer",
    submitting: "Envoi en cours...",
  },
} as const;
