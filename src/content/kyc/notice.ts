export const kycContent = {
  pending: {
    title: "Vérification en cours",
    body: "Votre profil est en cours de vérification. Vous recevrez une notification dès qu'elle sera terminée, et vous pourrez alors utiliser Rabotka pleinement.",
    shortLabel: "Vérification en cours",
  },
  rejected: {
    title: "Vérification refusée",
    body: "Votre vérification d'identité n'a pas été validée. Contactez notre support pour régulariser votre situation.",
    shortLabel: "Vérification refusée",
    supportLabel: "Contacter le support",
    supportMessage: "Bonjour, ma vérification d'identité a été refusée.",
  },
  screen: {
    backLabel: "Retour",
  },
} as const;
