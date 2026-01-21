import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import streetWorkersImage from "@/assets/street-workers.jpg";
import { realityContent } from "@/content/landing/reality";

export function RealitySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-20 lg:py-32 bg-secondary/30" ref={ref}>
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden shadow-medium order-2 lg:order-1"
          >
            <img
              src={streetWorkersImage}
              alt="Scène de rue africaine animée avec des travailleurs informels"
              className="w-full h-auto object-cover aspect-[16/10]"
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="space-y-6 order-1 lg:order-2"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
              {realityContent.badge}
            </span>
            
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight text-balance">
              {realityContent.title}
            </h2>
            
            <p className="text-lg text-muted-foreground">
              {realityContent.description}
            </p>

            <ul className="grid grid-cols-2 gap-3">
              {realityContent.workers.map((worker) => (
                <li
                  key={worker}
                  className="flex items-center gap-2 text-foreground"
                >
                  <span className="w-2 h-2 rounded-full bg-whatsapp" />
                  {worker}
                </li>
              ))}
            </ul>

            <p className="text-lg text-muted-foreground pt-4">
              {realityContent.conclusion}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
