import { motion, useInView } from "framer-motion";
import { useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import streetWorkersImage from "@/assets/street-workers.png";
import { realityContent } from "@/content/landing/reality";
import { getCategories } from "@/lib/api/job-category-controller";

const DISPLAY_COUNT = 6;

function WorkerListSkeleton() {
  return (
    <ul className="grid grid-cols-2 gap-3">
      {Array.from({ length: DISPLAY_COUNT }).map((_, i) => (
        <li key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-whatsapp/30 shrink-0" />
          <div
            className="h-4 rounded bg-muted-foreground/15 animate-pulse"
            style={{ width: `${60 + (i % 3) * 20}px` }}
          />
        </li>
      ))}
    </ul>
  );
}

export function RealitySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { data: categories, isLoading } = useQuery({
    queryKey: ["job-categories"],
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000,
  });

  const displayedNames = useMemo(() => {
    if (!categories?.length) return null;
    const shuffled = [...categories].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, DISPLAY_COUNT).map((c) => c.name);
  }, [categories]);

  const workerNames = displayedNames ?? [...realityContent.workers];

  return (
    <section
      className="py-20 lg:py-32 bg-secondary/30 overflow-x-hidden"
      ref={ref}
    >
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden shadow-medium order-2 lg:order-1"
          >
            <img
              src={streetWorkersImage}
              alt="Scène de rue africaine animée avec des travailleurs informels"
              className="w-full h-auto object-cover aspect-5/4"
            />
          </motion.div>

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

            {isLoading ? (
              <WorkerListSkeleton />
            ) : (
              <ul className="grid grid-cols-2 gap-3">
                {workerNames.map((name) => (
                  <li
                    key={name}
                    className="flex items-center gap-2 text-foreground"
                  >
                    <span className="w-2 h-2 rounded-full bg-whatsapp shrink-0" />
                    {name}
                  </li>
                ))}
              </ul>
            )}

            <p className="text-lg text-muted-foreground pt-4">
              {realityContent.conclusion}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
