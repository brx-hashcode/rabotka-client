import { Smartphone, Download, Users } from "lucide-react";
import type { Benefit } from '@/types';

export const whyWhatsAppContent = {
  badge: 'Pourquoi WhatsApp',
  title: 'La plateforme que les gens utilisent déjà',
  description: 'WhatsApp fait déjà partie du quotidien. Rabotka rencontre les gens là où ils sont.',
  benefits: [
    {
      icon: Download,
      title: "Pas de nouvelle appli à télécharger",
      description: "Utilisez l'application que vous avez déjà",
    },
    {
      icon: Smartphone,
      title: "Fonctionne sur les téléphones basiques",
      description: "Optimisé pour tous les appareils",
    },
    {
      icon: Users,
      title: "Familier pour toutes les générations",
      description: "Facile à utiliser pour tout le monde",
    },
  ] as Benefit[],
};
