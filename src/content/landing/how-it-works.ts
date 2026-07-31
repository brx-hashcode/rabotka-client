import { UserPlus, ShieldCheck, Link, MessageCircle, Unlock } from "lucide-react";
import type { Step } from "@/types";

export const howItWorksContent = {
  worker: {
    subtitle: "Pour les Travailleurs",
    title: "Comment ça marche pour les travailleurs",
    steps: [
      {
        icon: UserPlus,
        title: "Créez votre profil",
        description:
          "Renseignez vos informations, sélectionnez le rôle Travailleur et ajoutez votre pièce d'identité. Un crédit de bienvenue vous est offert.",
      },
      {
        icon: ShieldCheck,
        title: "Vérification d'identité (KYC)",
        description: "Votre identité est vérifiée pour garantir la confiance sur la plateforme.",
      },
      {
        icon: Link,
        title: "Activez votre accès WhatsApp",
        description:
          "Après validation, vous recevez un message WhatsApp. Tapez Menu pour démarrer.",
      },
      {
        icon: MessageCircle,
        title: "Postulez aux offres d'emploi",
        description:
          "Parcourez les missions disponibles, recevez des offres recommandées selon votre profil, ou retrouvez une offre précise grâce à sa référence.",
      },
      {
        icon: Unlock,
        title: "Débloquez le contact du recruteur",
        description:
          "Candidature acceptée ? Chacun débloque le contact de l'autre. Sans confirmation, vous êtes remboursé.",
      },
    ] as Step[],
  },

  employer: {
    subtitle: "Pour les Recruteurs",
    title: "Comment ça marche pour les recruteurs",
    steps: [
      {
        icon: UserPlus,
        title: "Créez votre profil",
        description:
          "Renseignez vos informations, sélectionnez le rôle Recruteur et ajoutez votre pièce d'identité. Un crédit de bienvenue vous est offert.",
      },
      {
        icon: ShieldCheck,
        title: "Vérification d'identité (KYC)",
        description: "Votre identité est vérifiée pour garantir la sécurité sur la plateforme.",
      },
      {
        icon: Link,
        title: "Activez votre accès WhatsApp",
        description:
          "Après validation, vous recevez un message WhatsApp. Tapez Menu pour démarrer.",
      },
      {
        icon: MessageCircle,
        title: "Consultez les candidatures",
        description:
          "Publiez votre offre et recevez les candidatures de travailleurs vérifiés, avec leur score de fiabilité, puis acceptez le meilleur profil.",
      },
      {
        icon: Unlock,
        title: "Débloquez le contact du travailleur",
        description:
          "Candidature acceptée ? Chacun débloque le contact de l'autre. Une offre à plusieurs postes ne se paie qu'une fois.",
      },
    ] as Step[],
  },
} as const;

type FlowContent = {
  title: string;
  steps: ReadonlyArray<{ title: string; description: string }>;
};

/**
 * Builds a schema.org HowTo object from a flow's on-page content so the
 * structured data can never drift from the steps shown to users.
 */
export function buildHowToSchema(flow: FlowContent, id: string) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": id,
    name: flow.title,
    step: flow.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.description,
    })),
  };
}

export const howToWorkerSchema = buildHowToSchema(
  howItWorksContent.worker,
  "https://rabotka.work/#how-to-worker",
);

export const howToEmployerSchema = buildHowToSchema(
  howItWorksContent.employer,
  "https://rabotka.work/#how-to-employer",
);
