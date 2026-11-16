import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { CalendarClock, VideoOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { config } from "@/config";

/**
 * The visio of a Rabotka event (a meeting the team invited you to): the
 * personal link from the email or WhatsApp opens the call under your name,
 * with no account. Our own Jitsi serves the call; the token comes from the API.
 */
type Join =
  | {
      provider: "hosted";
      domain: string;
      roomName: string;
      jwt: string;
      title: string;
      startsAt: string;
      displayName: string;
    }
  | { provider: "jitsi"; url: string; title: string }
  | { provider: "waiting"; opensAt: string; title: string; startsAt: string };

type JitsiApi = {
  addListener: (event: string, listener: () => void) => void;
  dispose: () => void;
};

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options: object) => JitsiApi;
  }
}

/** The same guest tools as the calls on Rabotka Business. */
const TOOLBAR = [
  "microphone",
  "camera",
  "toggle-camera",
  "select-background",
  "desktop",
  "chat",
  "raisehand",
  "closedcaptions",
  "participants-pane",
  "tileview",
  "settings",
  "fullscreen",
  "hangup",
];

const when = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Jitsi's own embed script, from our server: loaded once. */
function loadExternalApi(domain: string): Promise<void> {
  if (window.JitsiMeetExternalAPI) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("external_api"));
    document.head.appendChild(script);
  });
}

function Notice({
  icon,
  title,
  text,
  action,
}: Readonly<{
  icon: React.ReactNode;
  title: string;
  text: string;
  action?: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-6">
      <div className="max-w-sm space-y-3 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </span>
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{text}</p>
        {action}
      </div>
    </div>
  );
}

function Call({
  join,
  onLeave,
}: Readonly<{
  join: Extract<Join, { provider: "hosted" }>;
  onLeave: () => void;
}>) {
  const box = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let api: JitsiApi | null = null;
    let cancelled = false;
    loadExternalApi(join.domain)
      .then(() => {
        const ExternalApi = window.JitsiMeetExternalAPI;
        if (cancelled || !box.current || !ExternalApi) return;
        api = new ExternalApi(join.domain, {
          roomName: join.roomName,
          jwt: join.jwt,
          parentNode: box.current,
          width: "100%",
          height: "100%",
          lang: "fr",
          userInfo: { displayName: join.displayName },
          configOverwrite: {
            subject: join.title,
            prejoinConfig: {
              enabled: true,
              hideExtraJoinButtons: ["no-audio", "by-phone"],
            },
            toolbarButtons: TOOLBAR,
            recordings: { showPrejoinWarning: false },
            disableDeepLinking: true,
            disableInviteFunctions: true,
            enableWelcomePage: false,
            enableClosePage: false,
            disableThirdPartyRequests: true,
            notifications: [],
            logging: { defaultLogLevel: "error", loggers: {} },
          },
          interfaceConfigOverwrite: {
            SHOW_PROMOTIONAL_CLOSE_PAGE: false,
            MOBILE_APP_PROMO: false,
            SHOW_CHROME_EXTENSION_BANNER: false,
          },
        });
        api.addListener("readyToClose", onLeave);
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      api?.dispose();
    };
  }, [join, onLeave]);

  if (failed) {
    return (
      <Notice
        icon={<VideoOff className="size-6" />}
        title="La visio n'a pas pu se charger"
        text="Vérifiez votre connexion, puis rechargez la page."
      />
    );
  }
  return <div ref={box} className="size-full" />;
}

export default function Reunion() {
  const { room = "" } = useParams();
  const [params] = useSearchParams();
  const t = params.get("t") ?? "";
  const [join, setJoin] = useState<Join | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [left, setLeft] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setJoin(null);
    setError(null);
    fetch(
      `${config.apiUrl}/public/event-visio/${encodeURIComponent(room)}?t=${encodeURIComponent(t)}`,
    )
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(
            typeof body?.message === "string"
              ? body.message
              : "Lien invalide ou expiré.",
          );
          return;
        }
        setJoin(body as Join);
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            "La réunion n'a pas pu être chargée. Vérifiez votre connexion.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [room, t, attempt]);

  if (error) {
    return (
      <Notice
        icon={<VideoOff className="size-6" />}
        title="Visio indisponible"
        text={error}
      />
    );
  }
  if (!join) return <Skeleton className="h-dvh w-full rounded-none" />;

  if (join.provider === "waiting") {
    return (
      <Notice
        icon={<CalendarClock className="size-6" />}
        title={join.title}
        text={`La réunion commence ${when(join.startsAt)}. La visio ouvre 15 minutes avant : revenez par ce même lien.`}
        action={
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => setAttempt((n) => n + 1)}
          >
            Réessayer
          </Button>
        }
      />
    );
  }

  if (join.provider === "jitsi") {
    return (
      <Notice
        icon={<CalendarClock className="size-6" />}
        title={join.title}
        text="La visio s'ouvre dans un nouvel onglet."
        action={
          <Button
            className="rounded-full"
            onClick={() => window.open(join.url, "_blank", "noopener")}
          >
            Rejoindre la visio
          </Button>
        }
      />
    );
  }

  if (left) {
    return (
      <Notice
        icon={<VideoOff className="size-6" />}
        title="Vous avez quitté la réunion"
        text={join.title}
        action={
          <Button className="rounded-full" onClick={() => setLeft(false)}>
            Revenir dans la réunion
          </Button>
        }
      />
    );
  }

  return (
    <main className="fixed inset-0 bg-neutral-950">
      <Call join={join} onLeave={() => setLeft(true)} />
    </main>
  );
}
