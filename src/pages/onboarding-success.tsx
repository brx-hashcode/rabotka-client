import { useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { CheckCircle, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Seo } from "@/hooks/use-seo";
import { useWelcomeCredits } from "@/hooks/use-welcome-credits";
import { statusPagesContent } from "@/content/onboarding/modals";
import rabotkaLogo from "@/assets/rabotka-logo.png?format=webp";

const content = statusPagesContent.success;

export default function OnboardingSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get("email") ?? "";
  const profileType = (params.get("profileType") ?? "WORKER") as
    | "WORKER"
    | "EMPLOYER";

  const { data: credits } = useWelcomeCredits();
  const creditAmount =
    profileType === "EMPLOYER"
      ? credits?.employerCreditFcfa
      : credits?.workerCreditFcfa;

  const handleStart = () => {
    navigate("/login?redirect=/onboarding/avatar");
  };

  return (
    <>
      <Seo title="Compte créé - Rabotka" noIndex />
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
              className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                {content.title}
              </h1>
              <p className="text-muted-foreground text-sm">
                {content.subtitle}
              </p>
            </div>

            {creditAmount !== undefined && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="w-full flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3"
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

            <div className="w-full space-y-2 text-sm text-muted-foreground">
              {email && (
                <p>
                  {content.emailSent.replace("{profile_email}", email)}
                </p>
              )}
              <p>{content.whatsappMessage}</p>
            </div>

            <Button
              className="w-full"
              variant="whatsapp"
              size="lg"
              onClick={handleStart}
            >
              {content.button}
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
