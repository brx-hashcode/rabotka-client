import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import whatsappPhoneImage from "@/assets/whatsapp-phone.png";
import { whyWhatsAppContent } from "@/content/landing/why-whatsapp";

export function WhyWhatsAppSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-20 lg:py-32 bg-background overflow-x-hidden" ref={ref}>
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <span className="inline-block px-4 py-2 rounded-full bg-whatsapp-light text-whatsapp-dark text-sm font-medium">
                {whyWhatsAppContent.badge}
              </span>
              
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight text-balance">
                {whyWhatsAppContent.title}
              </h2>
              
              <p className="text-lg text-muted-foreground">
                {whyWhatsAppContent.description}
              </p>
            </div>

            <div className="grid gap-6">
              {whyWhatsAppContent.benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-card shadow-soft transition-all hover:shadow-medium"
                >
                  <div className="w-12 h-12 rounded-xl bg-whatsapp-light flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-whatsapp-dark" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-medium max-w-sm mx-auto">
              <img
                src={whatsappPhoneImage}
                alt="Mains tenant un téléphone avec WhatsApp"
                className="w-full h-auto object-cover aspect-3/4 lg:aspect-4/5"
              />
            </div>
            <div className="absolute -z-10 inset-0 bg-whatsapp/10 rounded-3xl transform rotate-3" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
