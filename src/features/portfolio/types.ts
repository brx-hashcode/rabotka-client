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

export type PortfolioProfile = {
  fullName: string;
  avatarUrl: string | null;
  address: string;
  description: string;
  reliabilityScore: number | null;
  ratingAvg: number | null;
  ratingCount: number;
  /** null hides the "Missions" stat (e.g. owner view where it isn't available). */
  completedMissionsCount: number | null;
};
