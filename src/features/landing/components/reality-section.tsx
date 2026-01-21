import streetWorkersImage from "@/assets/street-workers.jpg";

export function RealitySection() {
  const workers = [
    "Employés de maison",
    "Coiffeurs/Coiffeuses",
    "Répétiteurs",
    "Mécaniciens",
    "Freelances",
  ];

  return (
    <section className="py-20 lg:py-32 bg-secondary/30">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative rounded-3xl overflow-hidden shadow-medium order-2 lg:order-1">
            <img
              src={streetWorkersImage}
              alt="Scène de rue africaine animée avec des travailleurs informels"
              className="w-full h-auto object-cover aspect-[16/10]"
            />
          </div>

          {/* Content */}
          <div className="space-y-6 order-1 lg:order-2">
            <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
              Le Défi
            </span>
            
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight text-balance">
              Le travail informel est partout — mais les opportunités sont difficiles à trouver
            </h2>
            
            <p className="text-lg text-muted-foreground">
              Dans les villes africaines, des millions de personnes travaillent de manière informelle :
            </p>

            <ul className="grid grid-cols-2 gap-3">
              {workers.map((worker) => (
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
              Pourtant, trouver du travail dépend encore du bouche-à-oreille, de l'incertitude et des problèmes de confiance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
