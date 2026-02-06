import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqContent } from "@/content/landing/faq";
import { cn } from "@/lib/utils";

export function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="faq" className="py-20 lg:py-32 bg-background" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
            {faqContent.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {faqContent.description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqContent.items.map((item, index) => (
              <motion.div
                key={item.question}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className={cn(
                    "rounded-2xl bg-card border-none p-0 overflow-hidden shadow-soft",
                  )}
                >
                  <AccordionTrigger
                    className={cn(
                      "px-6 py-4 cursor-pointer  hover:no-underline",
                      "[&>svg]:hidden",
                      "[&[data-state=open]>div>div:last-child>svg]:rotate-180",
                    )}
                  >
                    <div className="flex items-center gap-4 flex-1 w-full">
                      <span className="font-display font-semibold text-foreground text-left flex-1">
                        {item.question}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-whatsapp-light flex items-center justify-center shrink-0">
                        <ChevronDown className="h-5 w-5 text-whatsapp-dark transition-transform duration-200" />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 pt-0">
                    <p className="text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
