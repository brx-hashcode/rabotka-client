export const validationMessages = {
  firstName: {
    min: "Minimum 2 caractères",
    max: "Maximum 50 caractères",
  },
  lastName: {
    min: "Minimum 2 caractères",
    max: "Maximum 50 caractères",
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
    min: "Minimum 5 caractères",
    max: "Maximum 500 caractères",
  },
  directPhone: {
    // No `required` — the field is optional. Only the format is checked, and
    // only when something was actually typed.
    invalid: "Numéro de téléphone invalide",
  },
  email: {
    // Optional too, for the same reason: most people sign up without one.
    invalid: "Email invalide",
  },
  phoneChange: {
    invalid: "Numéro de téléphone invalide",
    sameAsCurrent: "C'est déjà le numéro de votre compte",
    codeRequired: "Entrez le code à 6 chiffres",
  },
} as const;

