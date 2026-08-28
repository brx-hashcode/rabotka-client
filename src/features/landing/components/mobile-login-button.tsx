import { Button } from "@/components/ui/button";
import { headerContent } from "@/content/landing/header";
import { config } from "@/config";
import { trackWhatsAppClick } from "@/lib/analytics/events";

export const MobileLoginButton = () => {
  return (
    <Button
      size="default"
      variant="whatsapp"
      className="w-fit shadow-none"
      asChild
    >
      <a
        href={config.whatsapp.links.start}
        onClick={() => trackWhatsAppClick("start", "mobile_menu")}
        target="_blank"
        rel="noopener noreferrer"
      >
        {headerContent.cta.button}
      </a>
    </Button>
  );
};
