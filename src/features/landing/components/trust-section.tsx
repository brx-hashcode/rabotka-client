import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ShieldCheck, UserCheck, Users, Lock } from "lucide-react";
import { trustContent } from "@/content/landing/trust";

export function TrustSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="trust" className="py-20 lg:py-32 bg-background relative overflow-hidden" ref={ref}>
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-whatsapp/5 blur-3xl" />
      </div>

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-whatsapp-light mb-6">
            <ShieldCheck className="w-8 h-8 text-whatsapp-dark" />
          </div>
          
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
            {trustContent.title}
          </h2>
          
          <p className="text-lg text-muted-foreground">
            {trustContent.description}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {trustContent.features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="text-center p-8 rounded-3xl bg-card shadow-soft hover:shadow-medium transition-all"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-whatsapp/10 mb-6">
                <feature.icon className="w-8 h-8 text-whatsapp" />
              </div>
              
              <h3 className="font-display text-xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
