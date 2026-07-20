export const faqContent = {
  title: "Questions fréquentes",
  description:
    "Cette section regroupe les réponses aux principales questions relatives à Rabotka.",

  items: [
    {
      question: "Comment fonctionne Rabotka?",
      answer:
        "Tout se passe sur WhatsApp, sans application supplémentaire. Les employeurs publient une mission et reçoivent des candidatures. Les travailleurs parcourent les offres, en reçoivent qui correspondent à leur profil, et postulent. Quand l'employeur accepte une candidature, les deux parties débloquent leurs coordonnées et s'organisent directement.",
    },
    {
      question: "Rabotka est-il gratuit?",
      answer:
        "L'inscription, la publication d'une offre, la consultation des missions et les candidatures sont gratuites. Rabotka ne prend aucune commission sur le montant de la mission. Seul le déblocage des coordonnées est payant, et chaque nouveau membre reçoit un crédit de bienvenue qui couvre son premier contact.",
    },
    {
      question: "Comment puis-je contacter un travailleur ou un employeur?",
      answer:
        "Lorsqu'un employeur accepte la candidature d'un travailleur, les deux parties reçoivent une notification WhatsApp. Chacune débloque alors le contact de l'autre, via son portefeuille ou par Mobile Money (MTN ou Airtel). Si l'une des parties ne confirme pas, le paiement de l'autre est automatiquement recrédité sur son portefeuille. Votre crédit de bienvenue couvre entièrement ce premier déblocage.",
    },
    {
      question: "Comment Rabotka garantit-il la confiance?",
      answer:
        "Chaque profil est vérifié à partir d'une pièce d'identité valide et d'une photo de vous-même (selfie), examinées par notre équipe, et affiche ensuite un badge de vérification. Chaque profil porte aussi un score de fiabilité, visible avant tout engagement : il évolue avec les missions terminées et les évaluations mutuelles de 1 à 5 étoiles échangées après chaque mission.",
    },
    {
      question: "Quels types de services puis-je trouver sur Rabotka?",
      answer:
        "Rabotka couvre une large gamme de services informels, notamment l'aide ménagère, les répétiteurs, les coiffeurs, les réparateurs, les jardiniers, et bien plus encore. Si vous avez besoin d'un service ou si vous offrez un service, Rabotka peut vous aider à vous connecter.",
    },
  ],
} as const;

type FaqContent = {
  items: ReadonlyArray<{ question: string; answer: string }>;
};

/**
 * Builds a schema.org FAQPage object from the on-page questions so the
 * structured data can never drift from what visitors actually read. Mirrors
 * buildHowToSchema in ./how-it-works.ts.
 */
export function buildFaqSchema(faq: FaqContent, id: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": id,
    mainEntity: faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export const faqSchema = buildFaqSchema(faqContent, "https://rabotka.work/#faq");
