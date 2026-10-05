import { useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { CheckCircle, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Seo } from "@/hooks/use-seo";
import { statusPagesContent } from "@/content/onboarding/modals";

const content = statusPagesContent.success;

export default function OnboardingSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get("email") ?? "";
  const creditAmount = Number(params.get("credit") ?? 0);

  const handleStart = () => {
    navigate("/onboarding/avatar");
  };

  return (
    <>
      <Seo title="Compte créé - Rabotka" noIndex />
      <div className="min-h-dvh bg-background">
        {/* One column for everything, the shell's full width with the same
            gutter as login: the text, the credit card and the button share
            their edges instead of each being capped at its own width. */}
        <div className="flex min-h-dvh w-full flex-col px-6 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="flex flex-1 flex-col items-center justify-center py-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
            >
              <CheckCircle className="h-10 w-10 text-green-600" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="mb-6 w-full text-center"
            >
              <h1 className="mb-2 text-2xl font-bold text-foreground">
                {content.title}
              </h1>
              <p className="text-sm text-muted-foreground">{content.subtitle}</p>
            </motion.div>

            {creditAmount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6 flex w-full items-center gap-3 rounded-xl bg-green-50 px-4 py-3 shadow-soft"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <Gift className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium text-green-700">
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
              className="w-full space-y-2 text-center text-sm text-muted-foreground"
            >
              {email && (
                <p className="wrap-break-word">
                  {content.emailSent.replace("{profile_email}", email)}
                </p>
              )}
              <p>{content.whatsappMessage}</p>
            </motion.div>
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
      </div>
    </>
  );
}
