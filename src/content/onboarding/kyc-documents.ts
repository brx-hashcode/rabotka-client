export const kycDocumentsContent = {
  title: "Type de profil et documents KYC",
  subtitle: "Sélectionnez votre type de profil et téléchargez vos documents",
  profileType: {
    label: "Type de profil",
    placeholder: "Sélectionnez un type",
    options: {
      worker: "Travailleur",
      employer: "Employeur",
    },
    helperText: "Simplifiez le travail à employer !",
  },
  documentType: {
    label: "Type de document",
    placeholder: "Sélectionnez un type",
    options: {
      identityCard: "Carte d'identité",
      passport: "Passeport",
      driverLicense: "Permis de conduire",
    },
    helperText: "Type de document d'identité",
  },
  documents: {
    kycDocument: {
      label: "Document d'identité KYC",
      description:
        "Téléchargez une photo claire de votre pièce d'identité officielle (carte d'identité nationale, passeport ou permis de conduire). Le document doit être lisible, valide et toutes les informations doivent être visibles.",
      helperText: "JPG, JPEG, PNG - Max 5MB",
      infoTooltip:
        "Photo claire de votre pièce d'identité (recto/verso si nécessaire).",
      infoImageKey: "document" as const,
      infoImageAlt: "Exemple de document d'identité accepté",
    },
    kycSelfie: {
      label: "Selfie avec document d'identité",
      description:
        "Prenez un selfie en tenant votre pièce d'identité à côté de votre visage. Votre visage et le document doivent être clairement visibles et bien éclairés pour la vérification.",
      helperText: "JPG, JPEG, PNG - Max 5MB",
      infoTooltip:
        "Selfie avec votre visage et le document d'identité visibles côte à côte.",
      infoImageKey: "selfie" as const,
      infoImageAlt: "Exemple de selfie avec document d'identité",
    },
  },
  buttons: {
    back: "Retour",
    next: "Continuer",
  },
};
