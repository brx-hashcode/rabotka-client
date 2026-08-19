export const faqContent = {
  title: "Questions fréquentes",
  description:
    "Cette section regroupe les réponses aux principales questions relatives à Rabotka.",

  items: [
    {
      question: "Comment fonctionne Rabotka?",
      answer:
        "Tout se passe sur WhatsApp, sans application supplémentaire. Les recruteurs publient une mission et reçoivent des candidatures. Les travailleurs parcourent les offres, en reçoivent qui correspondent à leur profil, et postulent. Quand le recruteur accepte une candidature, les deux parties débloquent leurs coordonnées et s'organisent directement.",
    },
    {
      question: "Rabotka est-il gratuit?",
      answer:
        "L'inscription, la publication d'une offre, la consultation des missions et les candidatures sont gratuites. Rabotka ne prend aucune commission sur le montant de la mission. Seul le déblocage des coordonnées est payant, et chaque nouveau membre reçoit un crédit de bienvenue qui couvre son premier contact.",
    },
    {
      question: "Comment puis-je contacter un travailleur ou un recruteur?",
      answer:
        "Lorsqu'un recruteur accepte la candidature d'un travailleur, les deux parties reçoivent une notification WhatsApp. Chacune débloque alors le contact de l'autre, via son portefeuille ou par Mobile Money (MTN ou Airtel). Si l'une des parties ne confirme pas, le paiement de l'autre est automatiquement recrédité sur son portefeuille. Votre crédit de bienvenue couvre entièrement ce premier déblocage.",
    },
    {
      question: "Comment Rabotka garantit-il la confiance?",
      answer:
        "Chaque profil est vérifié à partir d'une pièce d'identité valide et d'une photo de vous-même (selfie), examinées par notre équipe, et affiche ensuite un badge de vérification. Chaque profil porte aussi un score de fiabilité, visible avant tout engagement : il évolue avec les missions terminées et les évaluations mutuelles de 1 à 5 étoiles échangées après chaque mission.",
    },
    {
      question: "Qu'est-ce que VoVa AI?",
      answer:
        "VoVa AI est l'assistant de Rabotka. Il répond à vos questions directement sur WhatsApp, dans la même conversation que le reste : comment fonctionne la vérification, ce qu'est le déblocage de contact, où en sont vos candidatures, quel est votre solde. Ses réponses viennent de la documentation Rabotka et de votre propre compte — quand il n'a pas la réponse, il vous le dit et vous oriente vers l'équipe plutôt que d'inventer. Il répond en français et en anglais.",
    },
    {
      question: "Est-ce que VoVa peut agir sur mon compte?",
      answer:
        "Non, et c'est voulu. VoVa consulte vos informations mais ne modifie jamais rien : il ne publie pas de mission, ne postule pas, ne paie pas, n'annule pas et ne débloque aucun contact à votre place. Tout ce qui engage quelque chose se fait dans l'application, où vous voyez ce que vous confirmez avant de le faire. VoVa ne communique jamais non plus un numéro de téléphone ni une adresse e-mail : les coordonnées ne s'échangent qu'après l'acceptation d'une candidature et le déblocage mutuel.",
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
