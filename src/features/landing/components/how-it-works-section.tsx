import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { UserPlus, ShieldCheck, Link, MessageCircle } from "lucide-react";
import workerSmilingImage from "@/assets/worker-smiling.jpg";
import familyHomeImage from "@/assets/family-home.jpg";
import { howItWorksContent } from "@/content/landing/how-it-works";

interface FlowProps {
  title: string;
  subtitle: string;
  steps: Array<{
    icon: React.ElementType;
    title: string;
    description: string;
  }>;
  image: string;
  imageAlt: string;
  reversed?: boolean;
  isInView: boolean;
}

const FlowCard = ({ title, subtitle, steps, image, imageAlt, reversed, isInView }: FlowProps) => {
  return (
    <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${reversed ? 'lg:flex-row-reverse' : ''}`}>
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: reversed ? 50 : -50 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8 }}
        className={`space-y-8 ${reversed ? 'lg:order-2' : ''}`}
      >
        <div className="space-y-4">
          <span className="inline-block px-4 py-2 rounded-full bg-whatsapp-light text-whatsapp-dark text-sm font-medium">
            {subtitle}
          </span>
          
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            {title}
          </h2>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-start gap-4 p-4 rounded-2xl bg-card shadow-soft"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-whatsapp text-primary-foreground font-bold flex-shrink-0">
                {index + 1}
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Image */}
      <motion.div
        initial={{ opacity: 0, x: reversed ? -50 : 50 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8 }}
        className={`relative ${reversed ? 'lg:order-1' : ''}`}
      >
        <div className="rounded-3xl overflow-hidden shadow-medium">
          <img
            src={image}
            alt={imageAlt}
            className="w-full h-auto object-cover aspect-[3/4] lg:aspect-[4/5]"
          />
        </div>
      </motion.div>
    </div>
  );
};

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-background overflow-x-hidden" ref={ref}>
      <div className="section-container space-y-24 lg:space-y-32">
        <FlowCard
          subtitle={howItWorksContent.worker.subtitle}
          title={howItWorksContent.worker.title}
          steps={howItWorksContent.worker.steps}
          image={workerSmilingImage}
          imageAlt="Travailleur souriant en utilisant son téléphone"
          isInView={isInView}
        />
        
        <FlowCard
          subtitle={howItWorksContent.employer.subtitle}
          title={howItWorksContent.employer.title}
          steps={howItWorksContent.employer.steps}
          image={familyHomeImage}
          imageAlt="Famille à la maison utilisant un smartphone"
          reversed
          isInView={isInView}
        />
      </div>
    </section>
  );
}
