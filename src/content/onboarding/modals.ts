export const statusPagesContent = {
  success: {
    title: "Bienvenue sur Rabotka !",
    subtitle: "Votre compte a été créé avec succès.",
    emailSent:
      "Un e-mail de confirmation a été envoyé à {profile_email}.",
    whatsappMessage:
      "Une fois votre profil vérifié, vous recevrez une invitation pour rejoindre Rabotka sur WhatsApp.",
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
