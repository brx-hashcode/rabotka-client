/**
 * What makes a worker's page convincing to an employer, as a checklist.
 *
 * Marketplaces measure it: Thumbtack reports that a profile photo is the
 * first thing a client looks at and that pros show about fifteen photos of
 * their work. Each step here is one of those things, checked against data the
 * profile already has.
 */
export const TARGET_PUBLICATIONS = 3;

export type ChecklistStep = {
  key: "photo" | "bio" | "domains" | "publications";
  label: string;
  done: boolean;
};

export function profileChecklist(
  profile: {
    avatarUrl: string | null;
    description: string;
    categoryIds: readonly string[];
  },
  publications: number,
): { steps: ChecklistStep[]; percent: number } {
  const shown = Math.min(publications, TARGET_PUBLICATIONS);
  const steps: ChecklistStep[] = [
    { key: "photo", label: "Ajouter une photo de profil", done: !!profile.avatarUrl },
    {
      key: "bio",
      label: "Décrire votre métier en quelques mots",
      done: profile.description.trim().length >= 20,
    },
    {
      key: "domains",
      label: "Choisir vos domaines",
      done: profile.categoryIds.length > 0,
    },
    {
      key: "publications",
      label: `Publier ${TARGET_PUBLICATIONS} réalisations (${shown}/${TARGET_PUBLICATIONS})`,
      done: publications >= TARGET_PUBLICATIONS,
    },
  ];
  const done = steps.filter((s) => s.done).length;
  return { steps, percent: Math.round((done / steps.length) * 100) };
}

/** The WhatsApp share link for a public portfolio. */
export function whatsAppShareLink(fullName: string, url: string): string {
  const text = `Découvrez mes réalisations sur Rabotka — ${fullName} : ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
