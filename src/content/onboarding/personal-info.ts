export const personalInfoContent = {
  title: "Informations personnelles",
  subtitle: "Remplissez vos informations personnelles",
  fields: {
    firstName: {
      label: "Prénom",
      placeholder: "John",
    },
    lastName: {
      label: "Nom",
      placeholder: "Doe",
    },
    email: {
      label: "Email",
      placeholder: "john.doe@gmail.com",
    },
    phone: {
      label: "Téléphone",
      placeholder: "+242069917686",
    },
    address: {
      label: "Adresse",
      placeholder: "19 rue de la joie Brazzaville",
    },
    description: {
      label: "À propos de vous",
      placeholder: "Présentez-vous en quelques phrases...",
      charCount: "/500",
    },
  },
  button: {
    continue: "Continuer",
  },
} as const;
