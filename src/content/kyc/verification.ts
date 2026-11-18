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
    body: "Un agent Rabotka vérifie votre identité. Vous recevrez un message sur WhatsApp dès que c'est terminé.",
    // No delay promised: a person checks each file, and the time varies.
    timelineTitle: "Où en est votre dossier",
    steps: {
      sent: { title: "Documents envoyés", body: "Pièce d'identité et selfie bien reçus." },
      review: { title: "Vérification en cours", body: "Un agent examine vos documents." },
      active: {
        worker: { title: "Compte activé", body: "Vous pourrez postuler aux missions." },
        employer: { title: "Compte activé", body: "Vous pourrez publier vos missions." },
      },
    },
    meanwhileTitle: "En attendant",
    meanwhile: {
      worker: [
        { label: "Complétez votre profil", hint: "Photo, description, domaines", to: "/profile" },
        { label: "Ajoutez votre CV", hint: "Les recruteurs le consultent", to: "/profile/cv" },
        { label: "Montrez vos réalisations", hint: "Des photos de votre travail", to: "/profile/portfolio" },
        { label: "Parcourez les offres", hint: "Repérez celles qui vous intéressent", to: "/jobs" },
      ],
      employer: [
        { label: "Complétez vos informations", hint: "Description, domaines, coordonnées", to: "/profile/informations" },
        { label: "Découvrez des profils", hint: "Les travailleurs de vos domaines", to: "/recherche" },
      ],
    },
  },
  verified: {
    title: "Identité vérifiée",
    body: "Votre identité est vérifiée : vous pouvez utiliser Rabotka pleinement.",
    action: {
      worker: { label: "Trouver des missions", to: "/jobs" },
      employer: { label: "Publier une mission", to: "/job-offers/new" },
    },
  },
  submit: "Envoyer pour vérification",
  submitting: "Envoi…",
  uploadFailed: "Échec de l'envoi du fichier. Veuillez réessayer.",
  submitFailed: "L'envoi a échoué. Vérifiez votre connexion et réessayez.",
  submitted: "Documents envoyés : la vérification commence.",
  back: "Retour",
} as const;
