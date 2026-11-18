export const kycContent = {
  pending: {
    title: "Vérification en cours",
    body: "Votre profil est en cours de vérification. Vous recevrez une notification dès qu'elle sera terminée, et vous pourrez alors utiliser Rabotka pleinement.",
    shortLabel: "Vérification en cours",
  },
  // Signed up without identity documents (« Plus tard »).
  missing: {
    title: "Vérifiez votre identité",
    body: "Pour postuler ou publier une mission, envoyez votre pièce d'identité et un selfie. Un agent Rabotka les vérifie ensuite.",
    shortLabel: "Vérifiez votre identité",
    actionLabel: "Envoyer mes documents",
  },
  rejected: {
    title: "Vérification refusée",
    body: "Votre vérification d'identité n'a pas été validée. Envoyez de nouveaux documents, ou contactez notre support si vous contestez ce refus.",
    shortLabel: "Vérification refusée",
    actionLabel: "Envoyer de nouveaux documents",
    supportLabel: "Contacter le support",
    supportMessage: "Bonjour, ma vérification d'identité a été refusée.",
  },
  screen: {
    backLabel: "Retour",
  },
} as const;
