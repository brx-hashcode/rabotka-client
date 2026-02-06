import { TrendingUp, Heart, Users } from "lucide-react";
import type { Impact } from "@/types";

export const impactContent = {
  badge: "Impact Social",
  title: "Créer des opportunités là où ça compte",
  impacts: [
    {
      icon: TrendingUp,
      text: "Autonomise les travailleurs informels",
    },
    {
      icon: Heart,
      text: "Réduit les frictions du chômage",
    },
    {
      icon: Users,
      text: "Soutient les familles et les communautés",
    },
  ] as Impact[],
} as const;
