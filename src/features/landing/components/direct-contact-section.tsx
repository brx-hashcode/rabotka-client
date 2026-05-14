import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Phone, MessageCircle, ArrowRight } from "lucide-react";
import phoneConversationImage from "@/assets/phone-conversation.jpg?format=webp";
import { directContactContent } from "@/content/landing/direct-contact";
import { onboardingPathWithProfile } from "@/lib/onboarding-navigation";
import { Link } from "react-router";

export function DirectContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      className="py-20 lg:py-32 bg-secondary/30 overflow-x-hidden"
      ref={ref}
    >
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden shadow-medium"
          >
            <img
              src={phoneConversationImage}
              alt="Deux personnes ayant une conversation téléphonique amicale"
              className="w-full h-auto object-cover aspect-16/10"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
                {directContactContent.badge}
              </span>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight text-balance">
                {directContactContent.title}
              </h2>

              <p className="text-lg text-muted-foreground">
                {directContactContent.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-3 bg-card p-4 rounded-2xl shadow-soft flex-1">
                <div className="w-12 h-12 rounded-xl bg-whatsapp-light flex items-center justify-center">
                  <Phone className="w-6 h-6 text-whatsapp-dark" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {directContactContent.methods[0].title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {directContactContent.methods[0].subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-card p-4 rounded-2xl shadow-soft flex-1">
                <div className="w-12 h-12 rounded-xl bg-whatsapp-light flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-whatsapp-dark" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {directContactContent.methods[1].title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {directContactContent.methods[1].subtitle}
                  </p>
                </div>
              </div>
            </div>

            <Link
              to={onboardingPathWithProfile("WORKER")}
              className="flex items-center gap-2 text-whatsapp font-medium group"
            >
              <span>{directContactContent.cta}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:underline" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
