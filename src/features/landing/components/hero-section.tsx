import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users } from "lucide-react";
import heroImage from "@/assets/hero-image.png";
import { heroContent } from "@/content/landing/hero";

export function HeroSection() {
  const { badge, title, description, cta, stats, floatingCard, imageAlt } = heroContent;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-linear-to-br from-background via-background to-whatsapp-light">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-whatsapp/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="section-container relative z-10 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-whatsapp-light text-whatsapp-dark text-sm font-medium">
                <badge.icon className="w-4 h-4" />
                {badge.text}
              </span>
              
              <h1 className="font-display text-4xl sm:text-5xl lg:text-5xl font-extrabold text-foreground leading-tight text-balance mb-6">
                {title.main}{' '}
                <span className="text-whatsapp">{title.highlight}</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                {description}
              </p>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="lg">
                <MessageCircle className="w-5 h-5" />
                {cta.primary}
              </Button>
              <Button variant="hero-outline" size="lg">
                <Users className="w-5 h-5" />
                {cta.secondary}
              </Button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center lg:justify-start gap-8 pt-4 text-sm text-muted-foreground"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-whatsapp animate-pulse-soft" />
                  <span>{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden">
              <img
                src={heroImage}
                alt={imageAlt}
                className="w-full h-auto object-cover aspect-4/3"
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute bottom-6 left-6 right-6 bg-card/95 backdrop-blur-sm rounded-2xl p-4 shadow-medium animate-float"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-whatsapp flex items-center justify-center shrink-0">
                    <floatingCard.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground text-sm">{floatingCard.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {floatingCard.subtitle}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
