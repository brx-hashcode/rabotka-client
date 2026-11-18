/** Profil › Vérification d'identité: sending the documents once signed in. */
export const kycVerificationContent = {
  seoTitle: "Vérification d'identité — Rabotka",
  title: "Vérification d'identité",
  missing: {
    intro:
      "Envoyez votre pièce d'identité et un selfie. Un agent Rabotka les vérifie ; une fois votre identité validée, vous pourrez postuler et publier des missions.",
  },
  rejected: {
    intro:
      "Votre vérification a été refusée. Corrigez ce qui est indiqué ci-dessous et envoyez de nouveaux documents.",
    reasonLabel: "Motif du refus",
  },
  pending: {
    title: "Documents reçus",
    body: "Vos documents sont en cours de vérification. Vous recevrez un message dès qu'elle sera terminée.",
  },
  verified: {
    title: "Identité vérifiée",
    body: "Votre identité est vérifiée : vous pouvez utiliser Rabotka pleinement.",
  },
  submit: "Envoyer pour vérification",
  submitting: "Envoi…",
  uploadFailed: "Échec de l'envoi du fichier. Veuillez réessayer.",
  submitFailed: "L'envoi a échoué. Vérifiez votre connexion et réessayez.",
  submitted: "Documents envoyés : la vérification commence.",
  back: "Retour",
} as const;
