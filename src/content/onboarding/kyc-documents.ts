export const kycDocumentsContent = {
  title: "Documents KYC",
  subtitle: "Téléchargez vos documents d'identité pour la vérification",
  profileType: {
    label: "Type de profil",
    placeholder: "Sélectionnez un type",
    options: {
      worker: "Travailleur",
      employer: "Recruteur",
    },
    helperText: "Simplifiez le recrutement !",
  },
  documentType: {
    label: "Type de document",
    placeholder: "Sélectionnez un type",
    options: {
      identityCard: "Carte d'identité",
      passport: "Passeport",
      driverLicense: "Permis de conduire",
      niuCard: "Carte NIU",
    },
    helperText: "Type de document d'identité",
  },
  documents: {
    kycDocument: {
      label: "Document d'identité — recto",
      description:
        "Téléchargez une photo claire du recto de votre pièce d'identité officielle (carte d'identité nationale, passeport, permis de conduire ou carte NIU). Le document doit être lisible, valide et toutes les informations doivent être visibles.",
      helperText: "JPG, JPEG, PNG - Max 5MB",
      infoTooltip: "Photo claire du recto de votre pièce d'identité.",
      infoImageKey: "document" as const,
      infoImageAlt: "Exemple de document d'identité accepté",
    },
    kycDocumentBack: {
      label: "Document d'identité — verso",
      description:
        "Téléchargez le verso du même document. C'est là que figurent la date de délivrance, la date d'expiration et la signature, indispensables à la vérification. Le passeport n'est pas concerné : toutes ses informations sont sur la page photo.",
      helperText: "JPG, JPEG, PNG - Max 5MB",
      infoTooltip:
        "Photo claire du verso, à plat et bien éclairé. Non demandé pour un passeport.",
      infoImageKey: "document" as const,
      infoImageAlt: "Exemple de verso de document d'identité",
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
} as const;
