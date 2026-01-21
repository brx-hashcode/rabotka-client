import { LucideIcon } from "lucide-react";

export interface NavLink {
  label: string;
  href: string;
}

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface Impact {
  icon: LucideIcon;
  text: string;
}

export interface FooterLinkGroup {
  [category: string]: string[];
}

export interface ContactInfo {
  address: string;
  email: string;
  phone: string;
}

export interface HeroContent {
  badge: {
    icon: LucideIcon;
    text: string;
  };
  title: {
    main: string;
    highlight: string;
    rest: string;
  };
  description: string;
  cta: {
    primary: string;
    secondary: string;
  };
  stats: Array<{
    label: string;
    value: string;
  }>;
  floatingCard: {
    title: string;
    subtitle: string;
    icon: LucideIcon;
  };
}
