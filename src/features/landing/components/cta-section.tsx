import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ctaContent } from "@/content/landing/cta";
import { config } from "@/config";
import rabotkaLogo from "@/assets/rabotka-logo.png?format=webp";
import { trackWhatsAppClick } from "@/lib/analytics/events";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 lg:py-32 bg-whatsapp-light" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-8"
        >
          <img
            src={rabotkaLogo}
            alt="Logo Rabotka"
            className="w-20 h-20 object-cover mx-auto"
          />

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            {ctaContent.title}
          </h2>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {ctaContent.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button variant="hero" size="lg" className="group" asChild>
              <a
                href={config.whatsapp.links.worker}
                onClick={() => trackWhatsAppClick("worker", "cta_section")}
                target="_blank"
                rel="noopener noreferrer"
              >
                {ctaContent.buttons.primary}
              </a>
            </Button>
            <Button variant="hero-outline" size="lg" className="group" asChild>
              <a
                href={config.whatsapp.links.employer}
                onClick={() => trackWhatsAppClick("employer", "cta_section")}
                target="_blank"
                rel="noopener noreferrer"
              >
                {ctaContent.buttons.secondary}
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
