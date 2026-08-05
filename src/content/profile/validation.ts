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
    min: "Minimum 80 caractères",
    max: "Maximum 500 caractères",
  },
} as const;

