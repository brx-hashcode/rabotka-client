import { useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Seo } from "@/hooks/use-seo";
import { statusPagesContent } from "@/content/onboarding/modals";
import rabotkaLogo from "@/assets/rabotka-logo.png?format=webp";

const content = statusPagesContent.error;

export default function OnboardingError() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const message = params.get("message") ?? content.defaultDescription;

  return (
    <>
      <Seo title="Erreur - Rabotka" noIndex />
      <div className="min-h-dvh flex flex-col items-center justify-center bg-background px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="flex flex-col items-center text-center gap-6 bg-white rounded-2xl p-8 shadow-sm border border-border">
            <img
              src={rabotkaLogo}
              alt="Rabotka"
              className="w-14 h-14 object-contain"
            />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100"
            >
              <XCircle className="w-10 h-10 text-red-600" />
            </motion.div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                {content.title}
              </h1>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>

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
        </motion.div>
      </div>
    </>
  );
}
