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
      label: "Numéro WhatsApp",
      placeholder: "Numéro avec indicatif pays",
      hint: "C'est sur ce numéro que vous recevrez vos connexions et vos notifications.",
    },
    directPhone: {
      label: "Numéro direct (facultatif)",
      placeholder: "Numéro avec indicatif pays",
      hint: "Si votre numéro WhatsApp n'est pas celui sur lequel on peut vous appeler.",
    },
    country: {
      hint: "Le pays où vous vous trouvez actuellement.",
    },
    address: {
      label: "Adresse",
      placeholder: "Moungali, 30 rue Bondo",
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
