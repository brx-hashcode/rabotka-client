export const loginContent = {
  step1: {
    title: "Connexion",
    description:
      "Veuillez renseigner votre adresse e-mail ou votre numéro de téléphone pour recevoir un code de vérification sécurisé.",

    placeholder: "Email ou numéro de téléphone",
    submitButton: "Continuer",
    label: "Email ou téléphone",
  },
  step2: {
    title: "Vérification",
    description:
      "Veuillez entrer le code de vérification à 6 chiffres qui a été envoyé à votre compte.",
    otpLabel: "Code de vérification",
    submitButton: "Vérifier",
    resendButton: "Renvoyer le code",
  },
  step3: {
    title: "Connexion réussie",
    redirecting: "Vous allez être redirigé dans quelques instants…",
  },
  error: {
    title: "Erreur de connexion",
    button: "Réessayer",
  },
  success: {
    title: "Connexion réussie",
    description: "Vous êtes connecté avec succès.",
    button: "Continuer",
  },
} as const;

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
} as const;

export const toastMessages = {
  step1: {
    success: {
      title: "Code de vérification envoyé",
      description:
        "Un code de vérification sécurisé a été envoyé à votre adresse e-mail ou à votre numéro de téléphone.",
    },
    error: {
      title: "Échec de l'envoi",
      description:
        "Une erreur est survenue lors de l'envoi du code de vérification. Veuillez réessayer.",
    },
  },

  step2: {
    success: {
      title: "Vérification réussie",
      description:
        "Votre identité a été vérifiée avec succès. Vous êtes maintenant connecté.",
    },
    error: {
      title: "Échec de la vérification",
      description:
        "Le code de vérification est invalide ou a expiré. Veuillez réessayer.",
    },
  },

  resendOtp: {
    success: {
      title: "Code renvoyé",
      description: "Un nouveau code de vérification a été envoyé avec succès.",
    },
    error: {
      title: "Échec de l'envoi",
      description:
        "Impossible de renvoyer le code pour le moment. Veuillez réessayer plus tard.",
    },
  },
} as const;
