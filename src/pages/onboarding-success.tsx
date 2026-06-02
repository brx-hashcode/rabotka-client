import { useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { CheckCircle, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Seo } from "@/hooks/use-seo";
import { useWelcomeCredits } from "@/hooks/use-welcome-credits";
import { useProfileMe } from "@/hooks/use-profile-me";
import { statusPagesContent } from "@/content/onboarding/modals";

const content = statusPagesContent.success;

export default function OnboardingSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get("email") ?? "";

  const { data: profile } = useProfileMe();
  const profileType = profile?.profileType ?? "WORKER";

  const { data: credits } = useWelcomeCredits(profileType);
  const creditAmount = credits?.creditFcfa;

  const handleStart = () => {
    navigate("/onboarding/avatar");
  };

  return (
    <>
      <Seo title="Compte créé - Rabotka" noIndex />
      <div className="min-h-dvh flex flex-col bg-background">
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="text-center max-w-xs mb-6"
          >
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {content.title}
            </h1>
            <p className="text-sm text-muted-foreground">{content.subtitle}</p>
          </motion.div>

          {creditAmount !== undefined && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6 w-full max-w-xs"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-green-100 shrink-0">
                <Gift className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="text-xs text-green-700 font-medium">
                  {content.creditLabel}
                </p>
                <p className="text-lg font-bold text-green-800">
                  {creditAmount.toLocaleString("fr-FR")} FCFA
                </p>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-2 text-sm text-muted-foreground text-center max-w-xs"
          >
            {email && (
              <p>{content.emailSent.replace("{profile_email}", email)}</p>
            )}
            <p>{content.whatsappMessage}</p>
          </motion.div>
        </div>

        <div className="px-6 pb-10 w-full max-w-sm mx-auto">
          <Button
            className="w-full"
            variant="whatsapp"
            size="lg"
            onClick={handleStart}
          >
            {content.button}
          </Button>
        </div>
      </div>
    </>
  );
}
