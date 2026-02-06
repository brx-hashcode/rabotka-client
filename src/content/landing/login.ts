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
    resendLink: "Renvoyer le code",
  },
  step3: {
    title: "Connexion réussie",
    redirecting: "Vous allez être redirigé dans quelques instants…",
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
