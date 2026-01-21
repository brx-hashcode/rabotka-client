import type { FooterLinkGroup, ContactInfo } from '@/types';

export const footerLinks: FooterLinkGroup = {
  Liens: ['Confidentialité', 'Conditions', 'Contact'],
};

export const contactInfo: ContactInfo = {
  address: 'Brazzaville, République du Congo',
  email: 'contact@rabotka.africa',
  phone: '+242 06 000 0000',
};

export const footerContent = {
  brandDescription: 'Fait avec ❤️ pour l\'Afrique',
  tagline: 'Fait avec ❤️ pour l\'Afrique',
  copyright: `© ${new Date().getFullYear()} Rabotka (Padrabotka). Tous droits réservés.`,
};
