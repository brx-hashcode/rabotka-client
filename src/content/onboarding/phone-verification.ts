/** Copy for the phone-number check at the end of signup step 1. */
export const phoneVerificationContent = {
  title: "Vérifiez votre numéro",
  description: (phone: string) =>
    `Nous avons envoyé un code à 6 chiffres sur WhatsApp au ${phone}. Il prouve que ce numéro est bien le vôtre.`,
  sending: "Envoi du code sur WhatsApp…",
  sendFailed: "Le code n'a pas pu être envoyé.",
  retry: "Réessayer",
  close: "Modifier mon numéro",
} as const;
