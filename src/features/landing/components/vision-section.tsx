import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, ArrowRight } from "lucide-react";
import citySunsetImage from "@/assets/city-sunset.png?format=webp";
import { visionContent } from "@/content/landing/vision";
import { config } from "@/config";

export function VisionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="about"
      className="relative py-20 lg:py-32 overflow-hidden"
      style={{ contentVisibility: "auto", containIntrinsicSize: "0 600px" }}
      ref={ref}
    >
      <div className="absolute inset-0">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
          style={{ backgroundImage: `url(${citySunsetImage})` }}
        />
        <div className="absolute inset-0 bg-linear-to-r from-foreground/90 via-foreground/80 to-foreground/60" />
      </div>

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-whatsapp/20 text-whatsapp-light text-sm font-medium">
              <MapPin className="w-4 h-4" />
              {visionContent.badge}
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight">
              {visionContent.title}
            </h2>

            <p className="text-xl text-primary-foreground/80">
              {visionContent.description}
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="pt-4"
            >
              <a
                href={config.whatsapp.links.start}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-whatsapp font-medium hover:underline"
              >
                {visionContent.cta}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
