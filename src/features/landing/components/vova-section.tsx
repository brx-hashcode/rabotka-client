import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { vovaContent } from "@/content/landing/vova";

/**
 * The assistant, stated rather than demonstrated.
 *
 * An earlier version put a scripted WhatsApp transcript at the centre of this
 * section. It went because a mock conversation is the one thing on a landing
 * page nobody believes: the visitor knows it was written to flatter the
 * product, it dates the moment a single sentence in the assistant changes, and
 * it spent the section's whole visual budget re-drawing an interface the reader
 * already has on their phone.
 *
 * What replaces it is the split the four claims always had — two abilities, two
 * limits — with the limits given the same weight as the abilities rather than
 * being buried underneath them.
 */
export function VovaSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="vova"
      className="py-20 lg:py-32 bg-background overflow-x-hidden"
      ref={ref}
    >
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-whatsapp-light text-whatsapp-dark text-sm font-medium">
            {vovaContent.badge}
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight text-balance">
            {vovaContent.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {vovaContent.description}
          </p>
        </motion.div>

        <div className="mt-14 grid gap-10 md:grid-cols-2 max-w-4xl mx-auto">
          {vovaContent.groups.map((group, groupIndex) => (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + groupIndex * 0.12 }}
            >
              <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-whatsapp-dark">
                {group.label}
              </h3>

              <ul className="mt-4 space-y-4">
                {group.points.map((point) => (
                  <li
                    key={point.title}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-card shadow-soft"
                  >
                    <div className="w-12 h-12 rounded-xl bg-whatsapp-light flex items-center justify-center shrink-0">
                      <point.icon
                        className="w-6 h-6 text-whatsapp-dark"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-foreground">
                        {point.title}
                      </h4>
                      <p className="text-muted-foreground">
                        {point.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
