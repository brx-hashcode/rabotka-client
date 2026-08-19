export type PortfolioImage = {
  id: string;
  imageUrl: string;
  position: number;
};

export type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  position: number;
  createdAt: string;
  images: PortfolioImage[];
};

/**
 * The header above a portfolio.
 *
 * No `description`: the profile bio used to sit here and took most of a phone
 * screen before a single realization was visible — on the owner's own page,
 * where they already know their bio, and on the public one, where a recruiter
 * came to see work rather than read a paragraph.
 *
 * It is still indexed on the public page: the bio feeds the `<Seo>` meta
 * description and the JSON-LD `Person`, so removing it from the layout costs
 * nothing with crawlers.
 */
export type PortfolioProfile = {
  fullName: string;
  avatarUrl: string | null;
  address: string;
  reliabilityScore: number | null;
  ratingAvg: number | null;
  ratingCount: number;
  /** null hides the "Missions" stat (e.g. owner view where it isn't available). */
  completedMissionsCount: number | null;
};
