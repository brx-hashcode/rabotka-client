import { useEffect, type ReactNode } from "react";
import { Seo } from "@/hooks/use-seo";

/**
 * The production issuer, written out rather than derived.
 *
 * `config.apiUrl` is the relative `/api/v1` this SPA proxies through, which
 * says nothing about the API's own host — and partners integrate against
 * production regardless of which environment they happen to be reading this
 * page on. Must match `OIDC_ISSUER` in the backend; changing one without the
 * other hands developers a discovery URL that does not resolve.
 */
const ISSUER = "https://api.rabotka.work";

/**
 * The public integration guide for "Login with Rabotka".
 *
 * The API's discovery document points at this URL as `service_documentation`,
 * so it is part of the protocol surface rather than marketing — a developer
 * lands here from their OIDC client's metadata.
 *
 * Written to be skimmed in that order: the discovery URL first, because a
 * conforming client needs nothing else; then the handful of things that
 * genuinely cause support tickets. The full reference lives alongside the code
 * in `rabotka-backend/docs/login-with-rabotka.md`; this page is the part a
 * partner needs before they have talked to anyone.
 */
export default function DevelopersLoginWithRabotka() {
  useEffect(() => {
    globalThis.scrollTo(0, 0);
  }, []);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-20 pt-24 sm:px-6 lg:pt-28">
      <Seo
        title="Connexion avec Rabotka — documentation développeur"
        description="Intégrez « Connexion avec Rabotka » : authentifiez vos utilisateurs avec leur compte Rabotka vérifié via OpenID Connect."
        canonical="/developers/login-with-rabotka"
      />

      <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
        Documentation développeur
      </span>

      <h1 className="mt-2 text-3xl font-bold">Connexion avec Rabotka</h1>

      <p className="text-muted-foreground mt-4 leading-relaxed">
        Authentifiez vos utilisateurs avec leur compte Rabotka. Vous recevez leur
        identité <strong className="text-foreground">et le verdict de
        vérification KYC de Rabotka</strong> : un administrateur a lu leur pièce
        d'identité et l'a confrontée à un selfie. C'est la raison d'intégrer —
        n'importe quel fournisseur d'identité peut confirmer un numéro de
        téléphone.
      </p>

      <Section title="En bref">
        <p>
          Rabotka est un fournisseur OpenID Connect standard (OAuth 2.1,
          Authorization Code + PKCE). Il n'y a rien de spécifique à écrire :
          pointez n'importe quelle bibliothèque OIDC vers
        </p>
        <Code>{`${ISSUER}/.well-known/openid-configuration`}</Code>
        <p>
          et elle se configure seule. Testé avec <Mono>openid-client</Mono>{" "}
          (Node), NextAuth/Auth.js, Passport, <Mono>expo-auth-session</Mono> et
          Spring Security.
        </p>
      </Section>

      <Section title="Obtenir des identifiants">
        <p>
          Les applications sont enregistrées par un administrateur Rabotka — il
          n'y a pas d'inscription en libre-service. Rabotka se porte garant de
          l'identité de ses utilisateurs auprès de qui détient un{" "}
          <Mono>client_id</Mono>, donc cela passe par une conversation.
        </p>
        <p>
          Écrivez-nous avec le nom de votre application, une description (elle
          s'affiche sur l'écran de consentement), votre logo et vos URI de
          redirection. Vous recevrez un <Mono>client_id</Mono> et un{" "}
          <Mono>client_secret</Mono>.
        </p>
        <Callout>
          Le secret n'est affiché qu'une seule fois. Rabotka n'en conserve qu'une
          empreinte et ne peut pas vous le redonner — en cas de perte, un
          administrateur le régénère.
        </Callout>
      </Section>

      <Section title="Les URI de redirection sont comparées à l'identique">
        <p>
          <Mono>https://vous.com/callback</Mono> et{" "}
          <Mono>https://vous.com/callback/</Mono> sont deux URI différentes.{" "}
          <Mono>http://</Mono> et <Mono>https://</Mono> aussi. Il n'y a ni
          joker ni motif : une URI comparée approximativement est une
          redirection ouverte, et une redirection ouverte sur un point de
          terminaison d'autorisation livre les codes de vos utilisateurs à qui
          les demande.
        </p>
        <p>
          Déclarez chacune en toutes lettres. <Mono>http://</Mono> n'est accepté
          que sur <Mono>localhost</Mono>.
        </p>
      </Section>

      <Section title="Le déroulé">
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            Redirigez l'utilisateur vers <Mono>/oauth/authorize</Mono> avec{" "}
            <Mono>state</Mono>, <Mono>nonce</Mono> et un{" "}
            <Mono>code_challenge</Mono> (PKCE — obligatoire, y compris pour les
            clients confidentiels).
          </li>
          <li>
            Il saisit son numéro, reçoit un code sur WhatsApp, puis accepte ou
            refuse le partage. S'il a déjà une session Rabotka, il ne voit que
            l'écran de consentement.
          </li>
          <li>
            Rabotka le renvoie vers votre <Mono>redirect_uri</Mono> avec un{" "}
            <Mono>code</Mono> et votre <Mono>state</Mono>. Vérifiez le{" "}
            <Mono>state</Mono> avant toute chose.
          </li>
          <li>
            <strong className="text-foreground">Depuis votre serveur</strong>,
            échangez le code contre les jetons. Le code vit 60 secondes et ne
            sert qu'une fois.
          </li>
        </ol>
      </Section>

      <Section title="Ce que vous recevez">
        <p>
          Un <Mono>id_token</Mono> : un JWT RS256 valable une heure, à vérifier
          contre <Mono>/.well-known/jwks.json</Mono>.
        </p>
        <Code>{`{
  "sub": "Xk9mP2vQ...",
  "given_name": "Amina",
  "family_name": "Nkemdirim",
  "phone_number": "+237690000000",
  "phone_number_verified": true,
  "rabotka_verified": true,
  "rabotka_verified_at": "2026-01-15T10:00:00.000Z"
}`}</Code>
      </Section>

      <Section title="phone_number_verified n'est pas rabotka_verified">
        <p>
          C'est la distinction à ne pas manquer.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <Mono>phone_number_verified</Mono> vaut toujours{" "}
            <Mono>true</Mono>. Cela signifie qu'un code a été livré sur WhatsApp
            à ce numéro et ressaisi pendant cette connexion. Cela prouve le
            contrôle du numéro, rien de plus.
          </li>
          <li>
            <Mono>rabotka_verified</Mono> est la décision d'un administrateur
            Rabotka après examen d'une pièce d'identité officielle et d'un
            selfie. C'est la donnée qui a de la valeur.
          </li>
        </ul>
        <p>
          Un compte peut avoir un téléphone vérifié et{" "}
          <Mono>rabotka_verified: false</Mono> — c'est l'état normal d'une
          inscription récente.
        </p>
      </Section>

      <Section title="Indexez vos utilisateurs sur sub">
        <p>
          Le <Mono>sub</Mono> d'une personne est propre à votre application : la
          même personne présente un <Mono>sub</Mono> entièrement différent chez
          un autre partenaire, et les deux ne peuvent pas être rapprochés.
        </p>
        <p>
          Il ne change jamais pour vous. N'indexez pas sur{" "}
          <Mono>phone_number</Mono> — les numéros changent de main, et un numéro
          recyclé fusionnerait silencieusement deux comptes.
        </p>
      </Section>

      <Section title="Deux absences volontaires">
        <p>
          <strong className="text-foreground">
            Le jeton d'accès n'est pas un JWT.
          </strong>{" "}
          C'est une chaîne opaque d'une heure qui ne sert qu'à{" "}
          <Mono>/userinfo</Mono>. Un partenaire à qui l'on remet deux JWT finit
          par vérifier le mauvais — ou par lire les claims du jeton d'accès sans
          rien vérifier du tout. L'opacité rend aussi la révocation immédiate.
        </p>
        <p>
          <strong className="text-foreground">
            Il n'y a pas de refresh token.
          </strong>{" "}
          Vous créez votre propre compte et votre propre session à partir de
          l'ID token : détenir en plus un identifiant durable sur Rabotka
          n'apporterait rien et exposerait beaucoup. Pour rafraîchir les
          données, renvoyez l'utilisateur vers <Mono>/authorize</Mono> — pour
          quelqu'un déjà connecté et ayant déjà consenti, c'est un aller-retour
          sans aucune interaction.
        </p>
      </Section>

      <Section title="Fenêtre surgissante ou redirection">
        <p>
          Le protocole est une redirection. Une popup n'est qu'une fenêtre dans
          laquelle vous choisissez de l'ouvrir : c'est votre page de callback
          qui détecte qu'elle s'y trouve, transmet le code à sa fenêtre parente
          et se ferme. Rabotka n'émet aucun <Mono>postMessage</Mono>.
        </p>
        <p>
          La redirection pleine page reste le choix le plus fiable, surtout sur
          mobile où les popups sont souvent bloquées. Si vous implémentez une
          popup, gardez le chemin par redirection fonctionnel : il vous le faut
          de toute façon pour ce cas-là.
        </p>
      </Section>

      <Section title="Nous écrire">
        <p>
          Pour enregistrer une application, ou si un secret vous semble
          compromis (nous pouvons fermer la fenêtre de grâce immédiatement) :{" "}
          <a
            className="text-primary font-medium hover:underline"
            href="mailto:contact@rabotka.co"
          >
            contact@rabotka.co
          </a>
          .
        </p>
      </Section>
    </main>
  );
}

function Section({
  title,
  children,
}: Readonly<{ title: string; children: ReactNode }>) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="text-muted-foreground mt-3 space-y-3 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

/**
 * `overflow-x-auto` rather than wrapping: these are URLs and JSON, where a line
 * break inserted for layout reasons changes what the reader copies.
 */
function Code({ children }: Readonly<{ children: string }>) {
  return (
    <pre className="bg-card shadow-soft overflow-x-auto rounded-lg p-4 text-xs">
      <code className="font-mono">{children}</code>
    </pre>
  );
}

function Mono({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.85em]">
      {children}
    </code>
  );
}

function Callout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="bg-muted text-foreground rounded-lg p-4 text-sm leading-relaxed">
      {children}
    </div>
  );
}
