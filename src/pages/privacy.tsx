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
      description="Quelles données personnelles Rabotka collecte, pourquoi, qui y accède et combien de temps elles sont conservées — vos pièces d'identité comprises, et vos droits au titre de la loi n° 29-2019."
      canonical="/privacy"
    >
      <article className={policyProseClassName}>
        <ReactMarkdown>{privacyMarkdown}</ReactMarkdown>
      </article>
    </PolicyShell>
  );
}
