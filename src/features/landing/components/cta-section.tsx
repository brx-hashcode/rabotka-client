import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, ArrowRight } from "lucide-react";
import { ctaContent } from "@/content/landing/cta";
import { onboardingPathWithProfile } from "@/lib/onboarding-navigation";
import rabotkaLogo from "@/assets/rabotka-logo.png";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

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
              <Link to={onboardingPathWithProfile("WORKER")}>
                <MessageCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
                {ctaContent.buttons.primary}
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" className="group" asChild>
              <Link to={onboardingPathWithProfile("EMPLOYER")}>
                <Users className="w-5 h-5 transition-transform group-hover:scale-110" />
                {ctaContent.buttons.secondary}
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
