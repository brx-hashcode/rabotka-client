import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLimeChrome } from "@/hooks/use-lime-chrome";
import notFoundImage from "@/assets/not-found.png?format=webp";
import rabotkaLogo from "@/assets/rabotka-logo.png?format=webp";

/** The agent app's 14-point starburst photo frame, as a CSS polygon. */
const STARBURST = (() => {
  const spikes = 14;
  const points: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? 50 : 41;
    const a = (Math.PI * i) / spikes - Math.PI / 2;
    points.push(`${(50 + r * Math.cos(a)).toFixed(2)}% ${(50 + r * Math.sin(a)).toFixed(2)}%`);
  }
  return `polygon(${points.join(", ")})`;
})();

/**
 * 404 in the agent app's look: a lime band with the brand and the lost
 * traveller in the starburst frame, then a short explanation and two ways
 * out. "Page précédente" only when there is somewhere to go back to — a link
 * opened cold has no history inside the app.
 */
export default function NotFound() {
  useLimeChrome();
  const navigate = useNavigate();
  const canGoBack =
    typeof window !== "undefined" && (window.history.state?.idx ?? 0) > 0;

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="rounded-b-[32px] bg-lime px-6 pb-10 pt-[max(1.25rem,calc(env(safe-area-inset-top)+0.75rem))] text-lime-foreground">
        <Link to="/" className="inline-flex items-center gap-2" aria-label="Rabotka — accueil">
          <img src={rabotkaLogo} alt="" className="size-9" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-extrabold">Rabotka</span>
            <span className="text-[11px] text-lime-muted">Job Matching</span>
          </span>
        </Link>

        <motion.img
          src={notFoundImage}
          alt=""
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto mt-6 aspect-square w-56 object-cover sm:w-64"
          style={{ clipPath: STARBURST }}
        />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8 text-center"
      >
        <span className="rounded-full bg-lime/60 px-3 py-1 text-xs font-medium text-lime-foreground">
          Erreur 404
        </span>
        <h1 className="mt-3 text-2xl text-foreground">Page introuvable</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Cette page n&apos;existe pas ou a été déplacée. Revenez à l&apos;accueil
          pour retrouver votre chemin.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3">
          <Button size="lg" asChild>
            <Link to="/">
              <Home />
              Retour à l&apos;accueil
            </Link>
          </Button>
          {canGoBack && (
            <Button size="lg" variant="secondary" onClick={() => navigate(-1)}>
              <ArrowLeft />
              Page précédente
            </Button>
          )}
        </div>
      </motion.main>
    </div>
  );
}
