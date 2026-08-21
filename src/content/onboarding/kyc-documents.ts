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

/**
 * Zone copy tailored to the document the user actually picked.
 *
 * "Téléchargez une photo de votre pièce d'identité" makes someone holding a NIU
 * card work out for themselves what counts and which side is which. Naming the
 * document, and saying what has to be readable on that particular side, removes
 * the guesswork -- and the guesswork is what produces the blurry, half-cropped
 * uploads a reviewer has to reject.
 *
 * Keyed loosely by document type: the form falls back to the generic copy in
 * `kycDocumentsContent.documents` when no type is chosen yet, and PASSPORT has
 * no `back` because its photo page carries everything.
 */
type ZoneCopy = { label: string; description: string };

export type KycDocumentGuidance = {
  front: ZoneCopy;
  back?: ZoneCopy;
  selfie: ZoneCopy;
};

export const kycDocumentGuidance: Record<string, KycDocumentGuidance> = {
  IDENTITY_CARD: {
    front: {
      label: "Carte d'identité — recto",
      description:
        "La face avec votre photo. Posez la carte à plat, cadrez les quatre coins et vérifiez que vos nom et prénoms sont lisibles.",
    },
    back: {
      label: "Carte d'identité — verso",
      description:
        "La face arrière, avec la date de délivrance, la date d'expiration et la signature. C'est ce que nous vérifions pour confirmer que la carte est toujours valide.",
    },
    selfie: {
      label: "Selfie avec votre carte d'identité",
      description:
        "Tenez la carte à côté de votre visage, face photo vers l'objectif. Votre visage et la carte doivent être nets tous les deux.",
    },
  },
  PASSPORT: {
    front: {
      label: "Passeport — page photo",
      description:
        "La page qui porte votre photo et vos informations. Cadrez-la entière, y compris les deux lignes de caractères en bas de page.",
    },
    selfie: {
      label: "Selfie avec votre passeport",
      description:
        "Tenez le passeport ouvert à la page photo, à côté de votre visage. Votre visage et la page doivent être nets tous les deux.",
    },
  },
  DRIVER_LICENSE: {
    front: {
      label: "Permis de conduire — recto",
      description:
        "La face avec votre photo et votre nom. Posez le permis à plat et cadrez les quatre coins.",
    },
    back: {
      label: "Permis de conduire — verso",
      description:
        "La face arrière, avec les catégories obtenues et la date d'expiration. C'est ce qui nous permet de confirmer que le permis est valide.",
    },
    selfie: {
      label: "Selfie avec votre permis de conduire",
      description:
        "Tenez le permis à côté de votre visage, face photo vers l'objectif. Votre visage et le permis doivent être nets tous les deux.",
    },
  },
  NIU_CARD: {
    front: {
      label: "Carte NIU — recto",
      description:
        "La face avec votre numéro d'identification unique et votre nom. Cadrez la carte entière, sans reflet sur le numéro.",
    },
    back: {
      label: "Carte NIU — verso",
      description:
        "La face arrière de la carte. Photographiez-la à plat, même si elle vous paraît peu chargée.",
    },
    selfie: {
      label: "Selfie avec votre carte NIU",
      description:
        "Tenez la carte à côté de votre visage, face lisible vers l'objectif. Votre visage et la carte doivent être nets tous les deux.",
    },
  },
};
