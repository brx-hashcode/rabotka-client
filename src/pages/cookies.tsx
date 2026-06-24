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
      description="Découvrez comment Rabotka utilise les cookies et technologies similaires, et comment gérer vos préférences."
      canonical="/cookies"
    >
      <article className={policyProseClassName}>
        <ReactMarkdown>{cookiesMarkdown}</ReactMarkdown>
      </article>
    </PolicyShell>
  );
}
