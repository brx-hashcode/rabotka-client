export const notificationsContent = {
  title: "Notifications",
  seoDescription: "Vos notifications Rabotka : qui a consulté votre profil, et plus.",
  bellLabel: (unread: number) =>
    unread > 0 ? `Notifications (${unread} non lues)` : "Notifications",
  markAll: "Tout marquer comme lu",
  clearAll: "Tout effacer",
  cancel: "Annuler",
  menuLabel: "Options des notifications",
  menuTitle: "Notifications",
  menuDescription: "Les notifications effacées ne réapparaîtront pas.",
  delete: "Supprimer",
  dismissError: "Impossible de supprimer la notification.",
  clearError: "Impossible d’effacer les notifications.",
  markAllError: "Impossible de marquer les notifications comme lues.",
  loadError: "Impossible de charger vos notifications.",
  empty: "Aucune notification pour le moment. Vous serez prévenu ici de tout ce qui concerne votre compte.",
  loadMore: "Voir plus",
} as const;
