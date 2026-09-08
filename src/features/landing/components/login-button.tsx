import { Button } from "@/components/ui/button";
import { headerContent } from "@/content/landing/header";
import { config } from "@/config";
import { trackWhatsAppClick } from "@/lib/analytics/events";

export const LoginButton = () => {
  return (
    <Button variant="whatsapp" size="default" asChild>
      <a
        href={config.whatsapp.links.start}
        onClick={() => trackWhatsAppClick("start", "header")}
        target="_blank"
        rel="noopener noreferrer"
      >
        {headerContent.cta.button}
      </a>
    </Button>
  );
};
