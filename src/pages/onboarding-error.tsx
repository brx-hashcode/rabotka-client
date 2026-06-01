import { useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Seo } from "@/hooks/use-seo";
import { statusPagesContent } from "@/content/onboarding/modals";

const content = statusPagesContent.error;

export default function OnboardingError() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const message = params.get("message") ?? content.defaultDescription;

  return (
    <>
      <Seo title="Erreur - Rabotka" noIndex />
      <div className="min-h-dvh flex flex-col bg-background">
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6"
          >
            <XCircle className="w-10 h-10 text-red-600" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="text-center max-w-xs"
          >
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {content.title}
            </h1>
            <p className="text-sm text-muted-foreground">{message}</p>
          </motion.div>
        </div>

        <div className="px-6 pb-10 w-full max-w-sm mx-auto">
          <Button
            className="w-full"
            size="lg"
            onClick={() =>
              navigate("/onboarding?step=personal-informations")
            }
          >
            {content.button}
          </Button>
        </div>
      </div>
    </>
  );
}
