export const statusPagesContent = {
  success: {
    title: "Bienvenue sur Rabotka !",
    subtitle: "Votre compte est créé.",
    creditLabel: "Crédit de bienvenue",
    creditHint: "Déjà dans votre portefeuille.",
    // What is done and what comes next, in order. The identity step reads
    // differently when the documents were sent (under review) or skipped
    // (« Plus tard »: to send). The welcome email says the same.
    nextTitle: "La suite",
    steps: {
      account: {
        title: "Compte créé",
        body: "Vos informations sont enregistrées.",
      },
      photo: {
        title: "Ajoutez une photo",
        body: "Un visage inspire confiance. C'est l'étape suivante.",
      },
      identityToSend: {
        title: "Vérifiez votre identité",
        body: "Envoyez votre pièce d'identité et un selfie depuis votre profil, rubrique Vérification d'identité.",
      },
      identityPending: {
        title: "Vérification de votre identité",
        body: "Un agent Rabotka examine vos documents. Vous recevrez un message sur WhatsApp dès qu'elle sera terminée.",
      },
      work: {
        title: "Postulez ou publiez une mission",
        body: "Dès que votre identité est vérifiée.",
      },
    },
    emailSent: "Un e-mail de confirmation a été envoyé à {profile_email}.",
    button: "Continuer",
  },

  error: {
    title: "Une erreur est survenue",
    defaultDescription:
      "Une erreur technique est survenue lors de la création de votre profil. Veuillez réessayer.",
    button: "Réessayer",
  },
} as const;
