import { Cookie } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCookieConsent } from "@/hooks/use-cookie-consent";
import { cookieConsentContent } from "@/content/cookie-consent";

export function CookieConsent() {
  const { showBanner, acceptConsent } = useCookieConsent();

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, x: -20, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -20, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 left-4 z-50 max-w-xs w-full"
        >
          <div className="bg-background rounded-lg shadow-soft p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 items-center">
            <div className="shrink-0">
              <Cookie className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-foreground leading-relaxed text-center">
              {cookieConsentContent.message}
            </p>
            <Button
              onClick={acceptConsent}
              variant="default"
              size="sm"
              className="w-full"
            >
              {cookieConsentContent.buttonText}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
