export const modalsContent = {
  success: {
    title: "Votre profil a été créé avec succès",
    emailSent:
      "Un e-mail de confirmation a été envoyé à l'adresse {profile_email}.",
    whatsappMessage:
      "Une fois votre profil vérifié, vous recevrez une invitation pour rejoindre Rabotka sur WhatsApp.",
    button: "J'ai compris",
  },

  error: {
    title: "Une erreur est survenue lors de la création de votre profil",
    defaultDescription:
      "Une erreur technique est survenue. Veuillez réessayer.",
    button: "Réessayer",
  },
} as const;
