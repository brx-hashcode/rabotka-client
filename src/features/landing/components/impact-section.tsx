import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { TrendingUp, Heart, Users } from "lucide-react";
import workersTogetherImage from "@/assets/workers-together.jpg";
import { impactContent } from "@/content/landing/impact";

export function ImpactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-20 lg:py-32 bg-background overflow-x-hidden" ref={ref}>
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden shadow-medium"
          >
            <img
              src={workersTogetherImage}
              alt="Groupe de travailleurs africains divers souriant ensemble"
              className="w-full h-auto object-cover aspect-[16/10]"
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <span className="inline-block px-4 py-2 rounded-full bg-whatsapp-light text-whatsapp-dark text-sm font-medium">
                {impactContent.badge}
              </span>
              
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight text-balance">
                {impactContent.title}
              </h2>
            </div>

            <div className="space-y-4">
              {impactContent.impacts.map((impact, index) => (
                <motion.div
                  key={impact.text}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-whatsapp-light"
                >
                  <div className="w-10 h-10 rounded-xl bg-whatsapp flex items-center justify-center flex-shrink-0">
                    <impact.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <p className="font-semibold text-foreground">{impact.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
