export const supportContent = {
  /** Row label in the profile action list, and the notice's link text. */
  button: "Contacter le support",
  drawer: {
    title: "Contacter le support",
    description:
      "L'équipe Rabotka vous répond du lundi au samedi, de 8h à 18h.",
    whatsappCta: "Écrire sur WhatsApp",
    close: "Fermer",
    phoneLabel: "Téléphone",
    emailLabel: "Email",
    addressLabel: "Adresse",
    unavailable: "Coordonnées indisponibles pour le moment.",
  },
  /** Fallback prefill — callers with a reason of their own pass theirs. */
  defaultMessage: "Bonjour, j'ai besoin d'aide sur Rabotka.",
} as const;
