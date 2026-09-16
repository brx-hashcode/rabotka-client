import { useEffect, useState, type ReactNode } from "react";
import { Seo } from "@/hooks/use-seo";
import { cn } from "@/lib/utils";
import { usePublicContact } from "@/hooks/use-public-contact";
import { CodeSampleTabs } from "@/features/oauth/components/code-sample-tabs";
import { CopyButton } from "@/features/oauth/components/copy-button";
import { CODE_SAMPLES } from "@/content/oauth/code-samples";
import { IDENTITY_CHECK_CODE_SAMPLES } from "@/content/identity-check/code-samples";
import type { PublicContactInfo } from "@/lib/api/system-config-controller";

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
 * The sidebar, and the anchor of every section, from one list.
 *
 * Labels are shorter than the headings they point at: a heading can afford to
 * be a full sentence ("phone_number_verified n'est pas rabotka_verified"), a
 * 200px rail cannot.
 */
const SECTIONS = [
  { id: "en-bref", label: "En bref", group: "login" },
  { id: "identifiants", label: "Obtenir des identifiants", group: "login" },
  { id: "sandbox", label: "Sandbox", group: "login" },
  { id: "redirect-uris", label: "URI de redirection", group: "login" },
  { id: "deroule", label: "Le déroulé", group: "login" },
  { id: "jetons", label: "Ce que vous recevez", group: "login" },
  { id: "sans-bibliotheque", label: "Sans bibliothèque", group: "login" },
  { id: "exemple", label: "Exemple complet", group: "login" },
  { id: "verification", label: "Vérification vs téléphone", group: "login" },
  { id: "sub", label: "Indexer sur sub", group: "login" },
  { id: "absences", label: "Absences volontaires", group: "login" },
  { id: "popup", label: "Popup ou redirection", group: "login" },
  { id: "verification-identite", label: "En bref", group: "identity" },
  { id: "ic-acces", label: "Activer l'API", group: "identity" },
  { id: "ic-creer", label: "Créer une vérification", group: "identity" },
  { id: "ic-statuts", label: "Statuts", group: "identity" },
  { id: "ic-resultat", label: "Lire le résultat", group: "identity" },
  { id: "ic-webhooks", label: "Webhooks", group: "identity" },
  { id: "ic-exemple", label: "Exemple complet", group: "identity" },
  { id: "ic-sandbox", label: "Sandbox", group: "identity" },
  { id: "ic-erreurs", label: "Erreurs et limites", group: "identity" },
  { id: "contact", label: "Nous écrire", group: "other" },
] as const;

/** The rail's group headings, in page order. `null` renders no heading. */
const GROUPS = [
  { id: "login", label: "Connexion avec Rabotka" },
  { id: "identity", label: "Vérification d'identité" },
  { id: "other", label: null },
] as const;

/**
 * Hoisted rather than derived inside the component: a fresh array on every
 * render is a fresh dependency, which would tear down and rebuild the
 * IntersectionObserver on every render.
 */
const SECTION_IDS = SECTIONS.map((section) => section.id);

/**
 * Which section the reader is currently in.
 *
 * `IntersectionObserver` against a band near the top of the viewport rather
 * than scroll-offset arithmetic: the latter has to be redone every time a
 * section's height changes, and gets the answer wrong while the smooth-scroll
 * from a sidebar click is still animating.
 */
function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // Top ~20% of the viewport: a heading is "current" once it reaches
      // reading position, not when it first appears at the bottom.
      { rootMargin: "-96px 0px -75% 0px", threshold: 0 },
    );

    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [ids]);

  return active;
}

/**
 * The rail. Hidden below `lg` — on a narrow screen it would push the prose into
 * a column too thin for code samples, and the page is short enough to scroll.
 */
function TableOfContents({ activeId }: Readonly<{ activeId: string | null }>) {
  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <nav
        aria-label="Sommaire"
        // `-mx-2.5` hangs each item's own padding outside the column, so the
        // TEXT lines up with the container edge — and therefore with the logo
        // in the header — while the active item's tint still extends past it.
        // Without it the whole rail reads as indented by 10px against
        // everything else on the page.
        className="sticky top-28 -mx-2.5 max-h-[calc(100svh-9rem)] overflow-y-auto"
      >
        {/*
          `px-2.5` matches the padding on each link, so the heading and the item
          labels share a left edge. Without it the links sit 10px further in
          than the word above them, which reads as a misalignment rather than as
          indentation.
        */}
        <p className="text-muted-foreground mb-3 px-2.5 text-xs font-semibold uppercase tracking-wide">
          Sommaire
        </p>
        {GROUPS.map((group) => (
          <div key={group.id} className="mb-4">
            {group.label && (
              <p className="text-foreground mb-1 px-2.5 text-xs font-semibold">
                {group.label}
              </p>
            )}
            <ul className="space-y-1">
              {SECTIONS.filter((section) => section.group === group.id).map(
                (section) => {
                  const isActive = section.id === activeId;
                  return (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        aria-current={isActive ? "location" : undefined}
                        className={cn(
                          "block rounded-md px-2.5 py-1.5 text-sm leading-snug transition-colors",
                          isActive
                            ? // The same pair the domain badges use: dark brown on
                              // warm sand. `bg-primary/10 text-primary` was green on
                              // green — around 2:1 contrast, below the 4.5:1 WCAG AA
                              // needs for body text, and tiring to read besides.
                              "bg-secondary text-secondary-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted",
                        )}
                      >
                        {section.label}
                      </a>
                    </li>
                  );
                },
              )}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

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
export default function DevelopersApiDocumentation() {
  useEffect(() => {
    globalThis.scrollTo(0, 0);
  }, []);

  const activeId = useActiveSection(SECTION_IDS);
  const { data: contact } = usePublicContact();
  const contactEmail = (contact as PublicContactInfo | undefined)?.email;

  return (
    // `section-container` rather than a bespoke max-width: the header and the
    // footer both use it, so the rail lines up with the logo above it instead
    // of starting at an unexplained offset.
    <div className="section-container flex gap-12 pb-20 pt-24 lg:pt-28">
      <Seo
        title="Documentation développeur Rabotka"
        description="Intégrez « Connexion avec Rabotka » (OpenID Connect) et l'API de vérification d'identité : confirmez qu'une personne est bien celle qu'elle prétend être, avec son accord."
        canonical="/developers/api-documentation"
      />

      <TableOfContents activeId={activeId} />

      <main className="min-w-0 max-w-3xl flex-1">
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          Documentation développeur
        </span>

        <h1 className="mt-2 text-3xl font-bold">Connexion avec Rabotka</h1>

        <p className="text-muted-foreground mt-4 leading-relaxed">
          Authentifiez vos utilisateurs avec leur compte Rabotka. Vous recevez
          leur identité{" "}
          <strong className="text-foreground">
            et le verdict de vérification KYC de Rabotka
          </strong>{" "}
          : un administrateur a lu leur pièce d'identité et l'a confrontée à un
          selfie. C'est la raison d'intégrer — n'importe quel fournisseur
          d'identité peut confirmer un numéro de téléphone.
        </p>

      <Section id="en-bref" title="En bref">
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

      <Section id="identifiants" title="Obtenir des identifiants">
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
          <Mono>client_secret</Mono>. Demandez la même chose pour{" "}
          <a
            href="#sandbox"
            className="text-primary font-medium hover:underline"
          >
            le sandbox
          </a>{" "}
          dans le même message : c'est avec celui-là que vous développerez, et
          les deux s'enregistrent en une fois.
        </p>
        <Callout>
          Le secret n'est affiché qu'une seule fois. Rabotka n'en conserve qu'une
          empreinte et ne peut pas vous le redonner — en cas de perte, un
          administrateur le régénère.
        </Callout>
      </Section>

      <Section id="sandbox" title="Le sandbox">
        <p>
          Construire votre intégration ne devrait pas demander un vrai compte
          Rabotka ni un vrai téléphone. Demandez-nous une{" "}
          <strong className="text-foreground">application sandbox</strong> :
          elle reçoit son propre <Mono>client_id</Mono> et son propre{" "}
          <Mono>client_secret</Mono>, et n'authentifie que deux utilisateurs
          fixes, avec un code fixe et sans aucun message WhatsApp.
        </p>

        <Code>{`+242 06 111 1111   →  rabotka_verified: true
+242 06 111 1112   →  rabotka_verified: false

Code de vérification : 111111`}</Code>

        <p>
          Il y en a deux parce qu'il y a deux réponses à tester. La seule
          différence entre eux est <Mono>rabotka_verified</Mono>, et c'est
          exactement la distinction que{" "}
          <a
            href="#verification"
            className="text-primary font-medium hover:underline"
          >
            la section plus bas
          </a>{" "}
          vous demande de ne pas manquer : une intégration qui n'a jamais vu
          autre chose que <Mono>true</Mono> part en production sans avoir écrit
          la branche qui compte.
        </p>

        <p className="text-foreground font-medium">
          Il n'y a pas d'URL distincte
        </p>
        <p>
          Même émetteur, même document de découverte, mêmes points de
          terminaison — <Mono>{ISSUER}</Mono> dans les deux cas. C'est le{" "}
          <Mono>client_id</Mono> que vous présentez qui décide, rien d'autre. Le
          PKCE est réel, la signature RS256 est réelle et se vérifie contre le
          même <Mono>/.well-known/jwks.json</Mono> : du code qui fonctionne
          contre le sandbox fonctionne en production sans une ligne de
          changement, et c'est tout l'intérêt.
        </p>

        <p className="text-foreground font-medium">Ce qui diffère quand même</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Une application sandbox n'authentifie{" "}
            <strong className="text-foreground">que</strong> ces deux numéros.
            Tout autre numéro reçoit « aucun compte », y compris le vôtre. La
            réciproque tient aussi : ces deux numéros ne fonctionnent sur aucune
            application de production.
          </li>
          <li>
            Le <Mono>sub</Mono> est propre à chaque application. Le même
            utilisateur sandbox présente donc un <Mono>sub</Mono> différent de
            celui qu'il aurait chez votre application de production —
            n'emportez pas ces comptes de test dans votre base réelle.
          </li>
          <li>
            L'écran de consentement réapparaît à chaque connexion : rien n'est
            enregistré, il n'y a donc pas de consentement acquis. Pratique pour
            travailler cet écran, mais ne vous en servez pas pour conclure que
            vos utilisateurs le reverront à chaque fois.
          </li>
          <li>
            Une application est sandbox ou ne l'est pas, décidé à
            l'enregistrement et jamais modifié ensuite. Si vous voulez les deux,
            demandez-nous deux applications — ce sont deux jeux d'identifiants.
          </li>
        </ul>

        <Callout>
          Le code <Mono>111111</Mono> n'a rien de secret et n'a de sens que pour
          ces deux numéros, sur une application sandbox. Il n'ouvre aucun compte
          réel, nulle part.
        </Callout>
      </Section>

      <Section id="redirect-uris" title="Les URI de redirection sont comparées à l'identique">
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

      <Section id="deroule" title="Le déroulé">
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

      <Section id="jetons" title="Ce que vous recevez">
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

      <Section id="sans-bibliotheque" title="Sans bibliothèque OIDC">
        <p>
          Rien n'oblige à utiliser une bibliothèque : le protocole n'est que du
          HTTP et du JSON. Trois appels suffisent, dans n'importe quel langage
          disposant d'un client HTTP et de SHA-256.
        </p>

        <p className="text-foreground font-medium">1. Préparer PKCE</p>
        <Code>{`code_verifier=$(openssl rand -base64 32 | tr -d '=+/' | cut -c1-43)
code_challenge=$(printf %s "$code_verifier" \\
  | openssl dgst -binary -sha256 \\
  | openssl base64 | tr '+/' '-_' | tr -d '=')`}</Code>
        <p>
          Gardez le <Mono>code_verifier</Mono> côté serveur, associé à la session
          du visiteur. Il ne doit jamais passer par le navigateur.
        </p>

        <p className="text-foreground font-medium">
          2. Envoyer l'utilisateur (redirection du navigateur)
        </p>
        <Code>{`${ISSUER}/api/v1/oauth/authorize
  ?client_id=VOTRE_CLIENT_ID
  &redirect_uri=https%3A%2F%2Fvous.com%2Fcallback
  &response_type=code
  &scope=openid%20profile%20phone%20rabotka%3Averification
  &state=UNE_VALEUR_ALEATOIRE
  &nonce=UNE_AUTRE_VALEUR
  &code_challenge=$code_challenge
  &code_challenge_method=S256`}</Code>

        <p className="text-foreground font-medium">
          3. Échanger le code, depuis votre serveur
        </p>
        <Code>{`curl -s -X POST ${ISSUER}/api/v1/oauth/token \\
  -u "VOTRE_CLIENT_ID:VOTRE_CLIENT_SECRET" \\
  -d grant_type=authorization_code \\
  -d code="$code" \\
  -d redirect_uri="https://vous.com/callback" \\
  -d code_verifier="$code_verifier"`}</Code>
        <p>
          La réponse contient <Mono>id_token</Mono> et <Mono>access_token</Mono>.
          Pour lire les informations de l'utilisateur, décodez la charge utile du
          JWT (la partie du milieu, en base64url) ou appelez{" "}
          <Mono>/userinfo</Mono> :
        </p>
        <Code>{`curl -s ${ISSUER}/api/v1/oauth/userinfo \\
  -H "Authorization: Bearer $access_token"`}</Code>

        <Callout>
          <strong>Pouvez-vous sauter la vérification de signature ?</strong> Oui,
          mais uniquement ici. OpenID Connect Core §3.1.3.7 l'autorise lorsque
          l'ID token arrive <em>directement</em> du point de terminaison{" "}
          <Mono>/token</Mono> : la validation TLS du serveur atteste déjà de
          l'émetteur. Dès que le jeton circule autrement — transmis à un autre
          service, mis en cache, relayé par un client — vous devez vérifier sa
          signature contre <Mono>/.well-known/jwks.json</Mono>. Vérifiez toujours{" "}
          <Mono>exp</Mono>, <Mono>aud</Mono> et <Mono>nonce</Mono>.
        </Callout>
      </Section>

      <Section id="exemple" title="Exemple complet">
        <p>
          Vous avez déjà votre <Mono>client_id</Mono> et votre{" "}
          <Mono>client_secret</Mono>. Voici l'intégration entière — le bouton, le
          retour, et la ligne où vous créez votre propre utilisateur. Tout le
          reste est du protocole.
        </p>

        <CodeSampleTabs samples={CODE_SAMPLES} />

        <p>
          Les quatre font la même chose : ils gardent le{" "}
          <Mono>code_verifier</Mono> en session côté serveur, vérifient le{" "}
          <Mono>state</Mono> au retour, échangent le code depuis le serveur,
          puis contrôlent <Mono>aud</Mono> et <Mono>nonce</Mono> avant de faire
          confiance aux claims.
        </p>
      </Section>

      <Section id="verification" title="phone_number_verified n'est pas rabotka_verified">
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

      <Section id="sub" title="Indexez vos utilisateurs sur sub">
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

      <Section id="absences" title="Deux absences volontaires">
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

      <Section id="popup" title="Fenêtre surgissante ou redirection">
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

      <Part
        id="verification-identite"
        title="API de vérification d'identité"
      >
        <p>
          Votre serveur demande à Rabotka :{" "}
          <em>la personne derrière ce numéro WhatsApp est-elle bien celle
          qu'elle prétend être ?</em> Vous envoyez le numéro et le nom qu'on vous
          a donnés. Rabotka demande son accord à la personne sur WhatsApp ; si
          elle accepte, Rabotka compare vos informations à son profil vérifié et
          vous renvoie le résultat.
        </p>
        <p>
          <strong className="text-foreground">
            Vous ne recevez jamais le profil lui-même.
          </strong>{" "}
          Vous apprenez si vos informations correspondent, pas ce que Rabotka
          détient.
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <Mono>POST /api/v1/identity-checks</Mono> avec le numéro et le nom.
            Réponse : <Mono>202 pending_consent</Mono>.
          </li>
          <li>
            La personne accepte ou refuse dans l'application Rabotka, sous 24
            heures.
          </li>
          <li>
            Rabotka envoie le résultat signé à votre webhook. Vous pouvez aussi
            interroger <Mono>GET /api/v1/identity-checks/{"{id}"}</Mono>.
          </li>
        </ol>
      </Part>

      <Section id="ic-acces" title="Activer l'API">
        <p>
          L'API utilise votre application « Connexion avec Rabotka » : même{" "}
          <Mono>client_id</Mono>, même <Mono>client_secret</Mono>. Un
          administrateur Rabotka doit l'activer pour votre application, et vous
          devez lui donner une <strong className="text-foreground">URL de
          webhook</strong> :
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            en <Mono>https</Mono> ; <Mono>http://localhost</Mono> n'est accepté
            que pour une application sandbox ;
          </li>
          <li>sans identifiants ni fragment (<Mono>#</Mono>) dans l'URL.</li>
        </ul>
        <p>
          Si vous n'utilisez que la vérification d'identité, vous n'avez besoin
          d'aucune URI de redirection. Tant que l'API n'est pas activée, chaque
          appel renvoie <Mono>403 identity_check_not_enabled</Mono>.
        </p>
        <p>
          Authentifiez-vous en HTTP Basic avec vos identifiants, comme sur{" "}
          <Mono>/oauth/token</Mono>. Les identifiants dans le corps de la
          requête ne sont pas acceptés ici.
        </p>
      </Section>

      <Section id="ic-creer" title="Créer une vérification">
        <Code>{`curl -s -X POST ${ISSUER}/api/v1/identity-checks \\
  -u "VOTRE_CLIENT_ID:VOTRE_CLIENT_SECRET" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: dossier-4821-essai-1" \\
  -d '{
    "phone": "+242061234567",
    "first_name": "Jean",
    "last_name": "Mabiala",
    "country_code": "CG",
    "city": "Brazzaville",
    "document_type": "IDENTITY_CARD",
    "reference": "dossier-4821"
  }'`}</Code>
        <FieldTable
          rows={[
            [
              "phone",
              "oui",
              "Numéro WhatsApp avec son indicatif. 00242… et les espaces sont acceptés ; un numéro sans indicatif est refusé (400 invalid_phone).",
            ],
            [
              "first_name, last_name",
              "oui",
              "Tels que vous les connaissez. L'ordre n'importe pas, et un nom plus court (sans les prénoms intermédiaires) correspond quand même.",
            ],
            ["country_code", "non", "ISO 3166-1 alpha-2, par exemple CG."],
            ["city", "non", "La ville déclarée."],
            [
              "document_type",
              "non",
              "IDENTITY_CARD, PASSPORT, DRIVER_LICENSE ou NIU_CARD.",
            ],
            [
              "reference",
              "non",
              "Votre propre identifiant (128 caractères max.), renvoyé dans chaque réponse.",
            ],
          ]}
        />
        <p>
          L'en-tête <Mono>Idempotency-Key</Mono> est facultatif : un nouvel
          essai avec la même clé renvoie la vérification d'origine au lieu d'en
          créer une seconde. Réutiliser une clé pour un autre numéro renvoie{" "}
          <Mono>409 idempotency_conflict</Mono>.
        </p>
        <Code>{`{
  "id": "5b0c…",
  "status": "pending_consent",
  "reference": "dossier-4821",
  "created_at": "2026-09-16T10:00:00.000Z",
  "expires_at": "2026-09-17T10:00:00.000Z",
  "completed_at": null
}`}</Code>
      </Section>

      <Section id="ic-statuts" title="Statuts">
        <FieldTable
          head={["status", "Signification"]}
          rows={[
            ["pending_consent", "En attente de la réponse de la personne."],
            [
              "completed",
              "La personne a accepté. Les champs du résultat sont présents.",
            ],
            [
              "not_completed",
              "Refusée, expirée, ou aucun compte. Pas de résultat, et completed_at vaut null.",
            ],
          ]}
        />
        <Callout>
          <strong>Vous ne pouvez pas savoir si le numéro a un compte.</strong>{" "}
          La réponse <Mono>202</Mono> est identique dans tous les cas, et un
          numéro sans compte, un refus et une absence de réponse finissent tous
          en <Mono>not_completed</Mono>. C'est voulu : sinon, l'API permettrait
          de savoir qui utilise Rabotka sans l'accord des personnes.
        </Callout>
        <p>
          Vous ne pouvez lire que les vérifications créées par votre propre
          application ; tout autre identifiant renvoie <Mono>404</Mono>.
        </p>
      </Section>

      <Section id="ic-resultat" title="Lire le résultat">
        <Code>{`{
  "id": "5b0c…",
  "status": "completed",
  "reference": "dossier-4821",
  "completed_at": "2026-09-16T10:04:12.000Z",
  "kyc": {
    "status": "verified",
    "verified_at": "2026-05-01T09:30:00.000Z",
    "account_status": "active"
  },
  "match": {
    "phone": "match",
    "name": { "level": "strong", "score": 94 },
    "country": "match",
    "city": "unknown",
    "document_type": "match"
  },
  "score": 95,
  "recommendation": "accept"
}`}</Code>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <Mono>kyc.status</Mono> : <Mono>verified</Mono> si un administrateur
            Rabotka a examiné la pièce d'identité et un selfie et les a
            approuvés, <Mono>pending</Mono> si cet examen n'a pas encore eu
            lieu, <Mono>rejected</Mono> s'il a été refusé. L'examen est fait par
            une personne, pas par une reconnaissance automatique.
          </li>
          <li>
            <Mono>kyc.account_status</Mono> : <Mono>active</Mono>,{" "}
            <Mono>pending_activation</Mono>, <Mono>suspended</Mono> ou{" "}
            <Mono>banned</Mono>.
          </li>
          <li>
            <Mono>match.phone</Mono> vaut toujours <Mono>match</Mono> : la
            personne a répondu depuis le compte Rabotka lié à ce numéro.
          </li>
          <li>
            <Mono>match.name.level</Mono> : <Mono>strong</Mono> (score ≥ 90),{" "}
            <Mono>partial</Mono> (≥ 75) ou <Mono>none</Mono>. Les accents, la
            casse, les tirets et l'ordre prénom/nom sont ignorés ; les petites
            fautes d'orthographe sont tolérées.
          </li>
          <li>
            <Mono>country</Mono>, <Mono>city</Mono>,{" "}
            <Mono>document_type</Mono> : <Mono>match</Mono>,{" "}
            <Mono>mismatch</Mono> ou <Mono>unknown</Mono>.{" "}
            <Mono>unknown</Mono> signifie que vous n'avez pas envoyé le champ,
            ou que le profil ne l'a pas ; il est alors exclu du score. Le pays
            et la ville sont déclarés par la personne à l'inscription, et ne
            sont pas vérifiés sur la pièce d'identité.
          </li>
        </ul>
        <p>
          <Mono>score</Mono> va de 0 à 100 : une moyenne pondérée des champs
          comparables (nom 70, pays 15, ville 10, type de pièce 5).
        </p>
        <FieldTable
          head={["recommendation", "Quand"]}
          rows={[
            [
              "accept",
              "KYC verified, score d'au moins 85, et le nom correspond.",
            ],
            [
              "review",
              "Les cas intermédiaires : par exemple une bonne correspondance avec un KYC encore pending, ou une personne vérifiée dont le pays diffère.",
            ],
            [
              "reject",
              "Le nom ne correspond pas, le KYC a été refusé, le compte est suspendu ou banni, ou le score est inférieur à 60.",
            ],
          ]}
        />
        <p>
          <Mono>recommendation</Mono> est une suggestion : la décision vous
          appartient.
        </p>
      </Section>

      <Section id="ic-webhooks" title="Webhooks">
        <p>
          Quand une vérification se termine (<Mono>completed</Mono> ou{" "}
          <Mono>not_completed</Mono>), Rabotka envoie une requête POST à votre
          URL de webhook :
        </p>
        <Code>{`POST https://vous.com/webhooks/rabotka
Content-Type: application/json
User-Agent: Rabotka-Webhooks/1.0

{ "jws": "eyJhbGciOiJSUzI1NiIsImtpZCI6…" }`}</Code>
        <p>
          Le résultat se trouve <strong className="text-foreground">à
          l'intérieur</strong> de <Mono>jws</Mono> : un JWS compact, signé en
          RS256 avec{" "}
          <strong className="text-foreground">
            la même clé que les ID tokens
          </strong>
          . Votre serveur le vérifie contre{" "}
          <Mono>{`${ISSUER}/.well-known/jwks.json`}</Mono>, puis lit la charge
          utile. Il n'y a pas de secret de webhook distinct.
        </p>
        <FieldTable
          head={["En-tête ou claim", "Valeur"]}
          rows={[
            ["typ (en-tête)", "rabotka-identity-check+jwt"],
            ["iss", ISSUER],
            ["aud", "votre client_id. Refusez toute autre valeur."],
            ["sub", "l'identifiant de la vérification"],
            ["jti", "unique pour chaque tentative d'envoi"],
            ["exp", "15 minutes après la signature"],
            ["event", "identity_check.updated"],
            ["check", "le même objet que GET /identity-checks/{id}"],
          ]}
        />
        <Callout>
          <strong>Pourquoi signer ?</strong> Une URL de webhook est une adresse
          publique : n'importe qui peut y envoyer une requête. Sans signature,
          un attaquant pourrait vous envoyer un faux{" "}
          <Mono>"recommendation": "accept"</Mono>. La signature prouve que le
          résultat vient de Rabotka, qu'il n'a pas été modifié, et qu'il vous
          était destiné.
        </Callout>
        <ul className="list-disc space-y-2 pl-5">
          <li>Répondez par un code 2xx en moins de 10 secondes.</li>
          <li>
            Toute autre réponse, une redirection ou un délai dépassé entraîne
            une nouvelle tentative : jusqu'à 8, avec un intervalle croissant à
            partir de 30 secondes, sur environ deux heures.
          </li>
          <li>Rabotka ne suit jamais une redirection vers une autre URL.</li>
          <li>
            Si vous avez manqué un envoi,{" "}
            <Mono>GET /api/v1/identity-checks/{"{id}"}</Mono> donne toujours
            l'état à jour.
          </li>
        </ul>
      </Section>

      <Section id="ic-exemple" title="Exemple complet">
        <p>
          Créer une vérification, puis recevoir et vérifier le webhook. Les
          quatre exemples contrôlent la signature, <Mono>iss</Mono> et{" "}
          <Mono>aud</Mono> avant de faire confiance au résultat.
        </p>
        <CodeSampleTabs samples={IDENTITY_CHECK_CODE_SAMPLES} />
      </Section>

      <Section id="ic-sandbox" title="Sandbox">
        <p>
          Une application sandbox ne contacte jamais une vraie personne, et ses
          vérifications se terminent aussitôt :
        </p>
        <FieldTable
          head={["phone", "Résultat"]}
          rows={[
            [
              "+242061111111",
              "completed, KYC verified. Nom enregistré : Rabotka Sandbox, Brazzaville, CG.",
            ],
            ["+242061111112", "completed, KYC pending. Même nom."],
            ["tout autre numéro", "not_completed"],
          ]}
        />
        <p>
          Envoyez un autre nom pour voir les niveaux <Mono>partial</Mono> et{" "}
          <Mono>none</Mono>. Le webhook d'une application sandbox peut utiliser{" "}
          <Mono>http://localhost</Mono>.
        </p>
      </Section>

      <Section id="ic-erreurs" title="Erreurs et limites">
        <p>
          Les erreurs ont la même forme que celles des points de terminaison
          OIDC :
        </p>
        <Code>{`{ "error": "identity_check_not_enabled", "error_description": "…" }`}</Code>
        <FieldTable
          head={["Statut", "error", "Quand"]}
          rows={[
            ["400", "invalid_phone", "Numéro sans indicatif ou mal formé."],
            ["400", "(message de validation)", "Champ manquant ou mal formé."],
            [
              "401",
              "invalid_client",
              "Identifiants absents ou faux, ou application suspendue.",
            ],
            [
              "403",
              "identity_check_not_enabled",
              "L'API n'est pas activée pour cette application.",
            ],
            ["404", "not_found", "Aucune vérification de ce nom pour vous."],
            [
              "409",
              "idempotency_conflict",
              "Idempotency-Key déjà utilisée pour un autre numéro.",
            ],
            ["429", "rate_limited", "Plus de 30 vérifications en une minute."],
          ]}
        />
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Par application</strong> : 30
            vérifications par minute.
          </li>
          <li>
            <strong className="text-foreground">Par adresse IP</strong> : 60
            requêtes par minute en POST, 120 en GET.
          </li>
          <li>
            <strong className="text-foreground">Par numéro</strong> : au plus 3
            messages WhatsApp de la même application en 24 heures. Au-delà, la
            vérification est acceptée comme les autres, mais la personne n'est
            pas relancée : elle se termine en <Mono>not_completed</Mono>.
          </li>
          <li>
            <strong className="text-foreground">Conservation</strong> : les
            informations que vous envoyez sont montrées à la personne pour
            qu'elle reconnaisse la demande, puis effacées 90 jours après la fin
            de la vérification.
          </li>
        </ul>
      </Section>

      <Section id="contact" title="Nous écrire">
        <p>
          Pour enregistrer une application, ou si un secret vous semble
          compromis (nous pouvons fermer la fenêtre de grâce immédiatement)
          {contactEmail ? " : " : "."}
          {/*
            The address comes from SystemConfig (`contact.email`) via
            /public/config/contact, the same source the footer reads — an admin
            changes it in Settings without a deploy. Rendered only once it has
            loaded rather than falling back to a hardcoded address: a stale
            address on the one page telling partners how to reach us is worse
            than a sentence with no address, and the footer below carries the
            same value anyway.
          */}
          {contactEmail && (
            <a
              className="text-primary font-medium hover:underline"
              href={`mailto:${contactEmail}`}
            >
              {contactEmail}
            </a>
          )}
          {contactEmail && "."}
        </p>
        </Section>
      </main>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: Readonly<{ id: string; title: string; children: ReactNode }>) {
  return (
    // `scroll-mt` clears the fixed header, so an anchor jump does not land with
    // the heading hidden underneath it.
    <section id={id} className="mt-10 scroll-mt-28">
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
    <div className="relative">
      <CopyButton value={children} />
      <pre className="bg-card shadow-soft overflow-x-auto rounded-lg p-4 pr-14 text-xs">
        <code className="font-mono">{children}</code>
      </pre>
    </div>
  );
}

/**
 * A part of the guide, one level above a section. Rendered as a large heading
 * with its own anchor so the rail can jump to the start of a product.
 */
function Part({
  id,
  title,
  children,
}: Readonly<{ id: string; title: string; children: ReactNode }>) {
  return (
    <section id={id} className="mt-20 scroll-mt-28">
      <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
        Documentation développeur
      </span>
      <h2 className="mt-2 text-3xl font-bold">{title}</h2>
      <div className="text-muted-foreground mt-4 space-y-3 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

/** A small reference table; the first column is always code. */
function FieldTable({
  head = ["Champ", "Requis", "Notes"],
  rows,
}: Readonly<{ head?: readonly string[]; rows: readonly (readonly string[])[] }>) {
  return (
    <div className="bg-card shadow-soft overflow-x-auto rounded-lg">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-muted/60">
            {head.map((cell) => (
              <th key={cell} className="text-foreground px-3 py-2 font-medium">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("|")} className="even:bg-muted/30 align-top">
              {row.map((cell, index) => (
                <td key={`${index}-${cell}`} className="px-3 py-2">
                  {index === 0 ? <Mono>{cell}</Mono> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
