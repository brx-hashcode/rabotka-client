import { UserCheck, Lock, Users } from "lucide-react";
import type { Feature } from '@/types';

export const trustContent = {
  title: 'Construit sur la confiance',
  description: 'Conçu pour protéger les travailleurs et les recruteurs. La sécurité est au cœur de tout ce que nous faisons.',
  features: [
    {
      icon: UserCheck,
      title: "Vérification des profils",
      description: "Chaque profil est examiné et vérifié",
    },
    {
      icon: Lock,
      title: "Contrôles d'identité",
      description: "Processus de vérification d'identité sécurisé",
    },
    {
      icon: Users,
      title: "Score de fiabilité",
      description: "Missions terminées, évaluations mutuelles de 1 à 5 étoiles, annulations tardives pénalisées : chaque profil reflète un historique réel",
    },
  ] as Feature[],
} as const;
