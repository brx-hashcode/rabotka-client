export const loginContent = {
  step1: {
    title: "Connexion",
    description:
      "Veuillez renseigner votre adresse e-mail ou votre numéro de téléphone pour recevoir un code de vérification sécurisé.",

    emailPlaceholder: "Email",
    phonePlaceholder: "Numéro de téléphone (+242XXXXXXXXX)",
    submitButton: "Continuer",
  },
  step2: {
    title: "Vérification",
    description: "Entrez le code à 6 chiffres envoyé à votre compte",
    otpLabel: "Code de vérification",
    submitButton: "Vérifier",
    resendLink: "Renvoyer le code",
  },
  step3: {
    redirecting: "Redirection en cours...",
  },
  success: {
    title: "Connexion réussie",
    description: "Vous allez être redirigé vers votre tableau de bord",
    button: "Continuer",
  },
  error: {
    title: "Erreur de connexion",
    button: "Réessayer",
  },
};

export const validationMessages = {
  emailOrPhone: {
    required: "Email ou numéro de téléphone requis",
    invalid:
      "Format invalide. Utilisez un email valide ou un numéro au format +242XXXXXXXXX",
  },
  otp: {
    length: "Le code doit contenir 6 caractères",
    invalid: "Code invalide. Utilisez uniquement des chiffres et lettres",
  },
};
