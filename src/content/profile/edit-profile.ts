export const editProfileContent = {
  sheet: {
    title: "Modifier le profil",
    description: "Mettez a jour vos informations personnelles",
  },
  avatar: {
    uploaded: "Photo de profil",
    upload: "Ajouter une photo",
    hint: "PNG, JPG jusqu'a 5Mo",
    uploading: "Telechargement...",
    errors: {
      uploadFailed: "Echec du telechargement de l'image",
      fileTooLarge: "Le fichier est trop volumineux (max 5Mo)",
      invalidType: "Format non supporte. Utilisez PNG ou JPG",
    },
  },
  fields: {
    address: {
      label: "Adresse",
      placeholder: "Rue, quartier",
    },
    firstName: {
      label: "Prenom",
      placeholder: "Votre prenom",
    },
    lastName: {
      label: "Nom",
      placeholder: "Votre nom",
    },
    description: {
      label: "A propos de moi",
      placeholder: "Decrivez-vous en quelques mots...",
      charCount: "/500",
    },
    directPhone: {
      label: "Numero direct (facultatif)",
      placeholder: "Numero avec indicatif pays",
      hint: "Si votre numero WhatsApp n'est pas celui sur lequel on peut vous appeler.",
    },
    email: {
      label: "Email (facultatif)",
      placeholder: "john.doe@gmail.com",
      hint: "Pour recevoir vos factures. Laissez vide si vous n'en avez pas.",
    },
  },
  categories: {
    label: "Domaines d'activité",
    hint: "Choisissez jusqu'à 5 domaines",
  },
  buttons: {
    edit: "Modifier",
    save: "Enregistrer",
    saving: "Enregistrement...",
  },
  toast: {
    success: "Profil mis a jour avec succes",
    error: "Erreur lors de la mise a jour du profil",
  },
} as const;
