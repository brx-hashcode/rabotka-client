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
      category: "Domaine d'activité",
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
    birthCertificate: "Acte de naissance",
    studentCard: "Carte étudiant",
    niuCard: "Carte NIU",
    other: "Autre",
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
} as const;
