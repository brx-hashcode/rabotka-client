import ReactMarkdown from "react-markdown";
import {
  PolicyShell,
  policyProseClassName,
} from "@/features/terms/policy-shell";
import { cookiesMarkdown } from "@/content/legal/cookies";

export default function Cookies() {
  return (
    <PolicyShell
      title="Politique des cookies – Rabotka"
      description="La liste complète de ce que Rabotka dépose sur votre appareil, à quoi cela sert et combien de temps cela reste — aucun cookie publicitaire ni de pistage."
      canonical="/cookies"
    >
      <article className={policyProseClassName}>
        <ReactMarkdown>{cookiesMarkdown}</ReactMarkdown>
      </article>
    </PolicyShell>
  );
}
