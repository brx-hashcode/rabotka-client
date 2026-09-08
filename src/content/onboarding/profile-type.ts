export const profileTypeContent = {
  title: "Type de profil",
  subtitle: "Choisissez votre rôle sur la plateforme",
  profileType: {
    label: "Type de profil",
    placeholder: "Sélectionnez un type",
    options: {
      worker: "Travailleur",
      employer: "Recruteur",
    },
    /**
     * Shown under the select, both lines at once and before the choice is made.
     * Putting them inside the dropdown would only explain the roles to someone
     * who had already thought to open it.
     */
    hint: {
      worker: "vous proposez vos services et cherchez des missions.",
      employer: "vous cherchez quelqu'un pour réaliser un travail.",
    },
  },
  categories: {
    label: "Domaines d'activité",
    hint: "Choisissez jusqu'à 5 domaines",
    /**
     * Says what the domains are FOR, which is the part that decides how
     * carefully someone picks them. Split by role because the consequence is
     * the mirror image on each side.
     */
    context: {
      worker:
        "Les métiers que vous exercez. C'est sur eux que reposent les missions qu'on vous proposera.",
      employer:
        "Les métiers pour lesquels vous publierez des missions. C'est sur eux qu'on choisira les profils à vous proposer.",
    },
  },
  buttons: {
    back: "Retour",
    next: "Continuer",
  },
} as const;
