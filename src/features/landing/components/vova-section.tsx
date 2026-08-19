import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check } from "lucide-react";
import rabotkaLogo from "@/assets/rabotka-logo.png?format=webp";
import { vovaContent } from "@/content/landing/vova";

/**
 * A real exchange, given the space it deserves.
 *
 * The first version put four identical icon-cards down the left and a small
 * chat beside them — the shape every generated landing page has, where the
 * reader skims four bold lines and takes in none of them. The conversation is
 * the only part of this section that shows the product rather than describing
 * it, so it is now the subject and the claims are a strip underneath.
 *
 * The transcript is what the assistant actually produces: it names itself, asks
 * one question, and explains rather than acting. The hero's old bubble promised
 * « J'ai trouvé 3 missions près de chez vous » — a behaviour that does not
 * exist, and the kind of thing a visitor discovers is untrue on day one.
 */
const CONVERSATION = [
  { from: "user", text: "Bonjour", time: "09:41" },
  {
    from: "vova",
    text: "Bonjour ! Je suis VoVa AI, l'assistant de Rabotka. Vous cherchez une mission, ou quelqu'un pour en réaliser une ?",
    time: "09:41",
  },
  { from: "user", text: "C'est quoi le déblocage de contact ?", time: "09:42" },
  {
    from: "vova",
    text: "Quand une candidature est acceptée, chacun débloque le contact de l'autre — et vous échangez ensuite directement, sans nous.",
    time: "09:42",
  },
] as const;

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

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-12 mx-auto max-w-md rounded-3xl bg-card shadow-medium overflow-hidden"
        >
          <div className="flex items-center gap-3 bg-whatsapp px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden p-1">
              <img
                src={rabotkaLogo}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-white text-sm">VoVa AI</p>
              <p className="text-xs text-white/80">en ligne</p>
            </div>
          </div>

          <div className="px-4 py-5 space-y-2.5 bg-whatsapp-light/40">
            {CONVERSATION.map((message, index) => {
              const mine = message.from === "user";
              return (
                <motion.div
                  key={message.text}
                  initial={{ opacity: 0, y: 8 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + index * 0.28 }}
                  className={mine ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={
                      mine
                        ? "max-w-[80%] rounded-2xl rounded-br-sm bg-whatsapp px-3.5 py-2 shadow-soft"
                        : "max-w-[80%] rounded-2xl rounded-bl-sm bg-card px-3.5 py-2 shadow-soft"
                    }
                  >
                    <p
                      className={
                        mine
                          ? "text-sm text-white"
                          : "text-sm text-foreground"
                      }
                    >
                      {message.text}
                    </p>
                    <span
                      className={
                        mine
                          ? "mt-0.5 block text-right text-[10px] text-white/70"
                          : "mt-0.5 block text-right text-[10px] text-muted-foreground"
                      }
                    >
                      {message.time}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 grid gap-x-10 gap-y-6 sm:grid-cols-2 max-w-3xl mx-auto"
        >
          {vovaContent.points.map((point) => (
            <li key={point.title} className="flex items-start gap-3">
              <Check
                className="mt-1 w-4 h-4 text-whatsapp-dark shrink-0"
                aria-hidden="true"
              />
              <p className="text-muted-foreground">
                <span className="font-display font-semibold text-foreground">
                  {point.title}.
                </span>{" "}
                {point.description}
              </p>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
