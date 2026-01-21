import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Wifi, Sparkles, Globe } from "lucide-react";
import communitySceneImage from "@/assets/community-scene.jpg";
import { accessibilityContent } from "@/content/landing/accessibility";

export function AccessibilitySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-20 lg:py-32 bg-secondary/30 overflow-x-hidden" ref={ref}>
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
                {accessibilityContent.badge}
              </span>
              
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight text-balance">
                {accessibilityContent.title}
              </h2>
              
              <p className="text-lg text-muted-foreground">
                {accessibilityContent.description}
              </p>
            </div>

            <div className="space-y-4">
              {accessibilityContent.features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-card shadow-soft"
                >
                  <div className="w-12 h-12 rounded-xl bg-whatsapp-light flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-whatsapp-dark" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden shadow-medium"
          >
            <img
              src={communitySceneImage}
              alt="Quartier communautaire africain vibrant"
              className="w-full h-auto object-cover aspect-[16/10]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
