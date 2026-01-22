import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { whatIsRabotkaContent } from "@/content/landing/what-is-rabotka";

export function WhatIsRabotkaSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-20 lg:py-32 bg-whatsapp-light" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-whatsapp/10 text-whatsapp-dark text-sm font-medium mb-4">
            {whatIsRabotkaContent.badge}
          </span>
          
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
            {whatIsRabotkaContent.title}
          </h2>
          
          <p className="text-lg text-muted-foreground">
            {whatIsRabotkaContent.description}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whatIsRabotkaContent.features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative bg-card rounded-2xl p-6 shadow-soft transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-whatsapp/10 flex items-center justify-center mb-4 transition-colors">
                <feature.icon className="w-7 h-7 text-whatsapp-dark" />
              </div>
              
              <h3 className="font-display font-bold text-foreground text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
