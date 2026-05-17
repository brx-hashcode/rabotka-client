export const personalInfoContent = {
  title: "Informations personnelles",
  subtitle: "Remplissez vos informations personnelles",
  fields: {
    firstName: {
      worker: {
        label: "Prénom",
        placeholder: "Jean",
      },
      employer: {
        label: "Prénom / Nom de l'entreprise",
        placeholder: "ex: EBTS Transports",
      },
    },
    lastName: {
      worker: {
        label: "Nom",
        placeholder: "Mabiala",
      },
      employer: {
        label: "Nom / Pays",
        placeholder: "ex: Congo",
      },
    },
    email: {
      worker: {
        label: "Email",
        placeholder: "john.doe@gmail.com",
      },
      employer: {
        label: "Email",
        placeholder: "contact@entreprise.com",
      },
    },
    phone: {
      label: "Téléphone",
      placeholder: "Numéro avec indicatif pays",
    },
    address: {
      label: "Adresse",
      placeholder: "19 rue de la joie Brazzaville",
    },
    description: {
      label: "Décrivez votre profil et ce que vous recherchez",
      placeholder: {
        worker:
          "Exemple : Je suis maçon avec 5 ans d'expérience dans les travaux de finition. Je recherche des missions ponctuelles ou à long terme à Pointe-Noire.",
        employer:
          "Exemple : Entreprise de logistique basée à Brazzaville. Nous recrutons régulièrement des manutentionnaires, chauffeurs et agents de terrain.",
      },
      charCount: "/500",
    },
  },
  button: {
    continue: "Continuer",
  },
} as const;
