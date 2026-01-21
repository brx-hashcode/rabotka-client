import { Wifi, Sparkles, Globe } from "lucide-react";
import communitySceneImage from "@/assets/community-scene.jpg";

export function AccessibilitySection() {
  const features = [
    {
      icon: Wifi,
      title: "Fonctionne avec peu d'internet",
      description: "Optimisé pour les connexions lentes",
    },
    {
      icon: Sparkles,
      title: "Aucune compétence technique requise",
      description: "Simple et intuitif pour tous",
    },
    {
      icon: Globe,
      title: "Adapté aux langues locales",
      description: "Communiquez dans votre langue",
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-secondary/30">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
                Conçu pour l'Afrique
              </span>
              
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight text-balance">
                Simple. Abordable. Accessible.
              </h2>
              
              <p className="text-lg text-muted-foreground">
                Conçu pour la vraie vie, pas pour la théorie. Rabotka fonctionne comme vous travaillez.
              </p>
            </div>

            <div className="space-y-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-card shadow-soft"
                >
                  <div className="w-12 h-12 rounded-xl bg-whatsapp-light flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-whatsapp-dark" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative rounded-3xl overflow-hidden shadow-medium">
            <img
              src={communitySceneImage}
              alt="Quartier communautaire africain vibrant"
              className="w-full h-auto object-cover aspect-[16/10]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
