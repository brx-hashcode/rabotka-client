import ReactMarkdown from "react-markdown";
import {
  PolicyShell,
  policyProseClassName,
} from "@/features/terms/policy-shell";
import { privacyMarkdown } from "@/content/legal/privacy";

export default function Privacy() {
  return (
    <PolicyShell
      title="Politique de confidentialité – Rabotka"
      description="Découvrez comment Rabotka collecte, utilise et protège vos données personnelles, y compris vos pièces d'identité lors de la vérification."
      canonical="/privacy"
    >
      <article className={policyProseClassName}>
        <ReactMarkdown>{privacyMarkdown}</ReactMarkdown>
      </article>
    </PolicyShell>
  );
}
