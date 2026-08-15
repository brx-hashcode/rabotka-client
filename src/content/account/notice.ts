export const accountContent = {
  // Role-neutral bodies. These first covered the worker side only ("vous ne
  // pouvez pas y postuler"), which read as nonsense to a suspended EMPLOYER
  // looking at a dead "Contacter" button — the same gate now guards both.
  suspended: {
    title: "Compte suspendu",
    body: "Votre compte est suspendu. Vous pouvez continuer à consulter la plateforme, mais vous ne pouvez ni postuler, ni publier d'offre, ni contacter un profil tant qu'il n'est pas rétabli.",
    shortLabel: "Compte suspendu",
    supportLabel: "Contacter le support",
    supportMessage: "Bonjour, mon compte est suspendu et je souhaite le régulariser.",
  },
  banned: {
    title: "Compte banni",
    body: "Votre compte a été banni. Vous ne pouvez plus effectuer d'action sur la plateforme. Contactez le support si vous pensez qu'il s'agit d'une erreur.",
    shortLabel: "Compte banni",
    supportLabel: "Contacter le support",
    supportMessage: "Bonjour, mon compte a été banni et je souhaite comprendre pourquoi.",
  },
  pendingActivation: {
    title: "Compte non activé",
    body: "Votre compte n'est pas encore activé. Vous pourrez postuler, publier et contacter dès son activation.",
    shortLabel: "Compte non activé",
  },
} as const;
