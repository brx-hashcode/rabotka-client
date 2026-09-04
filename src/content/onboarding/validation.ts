export const validationMessages = {
  firstName: {
    min: "Minimum 2 caractères",
    max: "Maximum 50 caractères",
  },
  lastName: {
    min: "Minimum 2 caractères",
    max: "Maximum 50 caractères",
  },
  email: {
    invalid: "Email invalide",
  },
  phone: {
    required: "Numéro de téléphone requis",
    invalid: "Numéro de téléphone invalide pour le pays sélectionné",
  },
  directPhone: {
    // No `required` — the field is optional. Only the format is checked, and
    // only when something was actually typed.
    invalid: "Numéro de téléphone invalide pour le pays sélectionné",
    sameAsPhone: "Ce numéro est déjà votre numéro WhatsApp",
  },
  country: {
    required: "Sélectionnez un pays",
  },
  city: {
    required: "Sélectionnez une ville",
  },
  address: {
    min: "Adresse trop courte",
    max: "Adresse trop longue",
  },
  description: {
    min: "Minimum 80 caractères",
    max: "Maximum 500 caractères",
  },
  profileType: {
    required: "Sélectionnez un type de profil",
  },
  categoryId: {
    required: "Sélectionnez un domaine d'activité",
  },
  documentType: {
    required: "Sélectionnez un type de document",
  },
  kycDocument: {
    invalid: "Document invalide (PDF, JPG, PNG - Max 5MB)",
  },
  kycDocumentBack: {
    invalid: "Verso invalide (JPG, PNG - Max 5MB)",
    required: "Ajoutez le verso de votre document",
  },
  kycSelfie: {
    invalid: "Selfie invalide (JPG, PNG - Max 5MB)",
  },
} as const;
