export const statusPagesContent = {
  success: {
    title: "Bienvenue sur Rabotka !",
    subtitle: "Votre compte a été créé avec succès.",
    emailSent:
      "Un e-mail de confirmation a été envoyé à {profile_email}.",
    // No invitation to "join Rabotka on WhatsApp": onboarding happens through
    // WhatsApp, so the user is already there. Activation is the only thing they
    // are actually waiting for, so it is the only thing this line says. The
    // welcome email closes on the same sentence.
    whatsappMessage:
      "Vous recevrez un message sur WhatsApp dès que votre compte sera activé.",
    creditLabel: "Crédit de bienvenue accordé",
    button: "Commencer",
  },

  error: {
    title: "Une erreur est survenue",
    defaultDescription:
      "Une erreur technique est survenue lors de la création de votre profil. Veuillez réessayer.",
    button: "Réessayer",
  },
} as const;
