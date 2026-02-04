import { useLocation, Link } from "react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import notFoundImage from "@/assets/not-found.png";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src={notFoundImage}
          alt="Page non trouvée - Erreur 404"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-6"
        >
          <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-extrabold text-white mb-4 drop-shadow-lg">
            404
          </h1>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-md">
            Vous semblez perdu...
          </h2>

          <p className="text-lg sm:text-xl text-white/90 mb-8 drop-shadow-sm max-w-xl mx-auto">
            Cette page n'existe pas ou a été déplacée. Ne vous inquiétez pas,
            nous pouvons vous aider à retrouver votre chemin.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button variant="whatsapp" size="lg" asChild>
              <Link to="/">
                <Home className="w-5 h-5" />
                Retourner à l'accueil
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
