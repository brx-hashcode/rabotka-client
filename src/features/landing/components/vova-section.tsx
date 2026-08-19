import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import rabotkaLogo from "@/assets/rabotka-logo.png?format=webp";
import { vovaContent } from "@/content/landing/vova";

/**
 * A real exchange, not a mockup of a nicer product.
 *
 * The transcript below is the shape the assistant actually produces: it names
 * itself, asks one question, and sends you to the app rather than doing the
 * thing for you. The hero's old chat bubble promised « J'ai trouvé 3 missions
 * près de chez vous » — a behaviour that does not exist — and a visitor who
 * arrives expecting it is disappointed by a working product.
 */
const CONVERSATION = [
  {
    from: "user" as const,
    text: "Bonjour",
  },
  {
    from: "vova" as const,
    text: "Bonjour ! Je suis VoVa AI, l'assistant de Rabotka. Vous cherchez une mission, ou quelqu'un pour en réaliser une ?",
  },
  {
    from: "user" as const,
    text: "C'est quoi le déblocage de contact ?",
  },
  {
    from: "vova" as const,
    text: "Quand une candidature est acceptée, chacun débloque le contact de l'autre — et vous échangez ensuite directement, sans nous.",
  },
];

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
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <span className="inline-block px-4 py-2 rounded-full bg-whatsapp-light text-whatsapp-dark text-sm font-medium">
                {vovaContent.badge}
              </span>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight text-balance">
                {vovaContent.title}
              </h2>

              <p className="text-lg text-muted-foreground">
                {vovaContent.description}
              </p>
            </div>

            <div className="grid gap-6">
              {vovaContent.features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-card shadow-soft transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-whatsapp-light flex items-center justify-center shrink-0">
                    <feature.icon className="w-6 h-6 text-whatsapp-dark" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
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
            <div className="max-w-sm mx-auto rounded-3xl bg-card shadow-medium p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shrink-0 overflow-hidden p-1">
                  <img
                    src={rabotkaLogo}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    VoVa AI
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Assistant Rabotka
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {CONVERSATION.map((message, index) => (
                  <motion.div
                    key={message.text}
                    initial={{ opacity: 0, y: 8 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.5 + index * 0.25 }}
                    className={
                      message.from === "user"
                        ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-whatsapp-light px-4 py-2.5"
                        : "mr-auto max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5"
                    }
                  >
                    <p className="text-sm text-foreground">{message.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
