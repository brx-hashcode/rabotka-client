import { Wifi, Sparkles, Globe } from "lucide-react";
import communitySceneImage from "@/assets/community-scene.jpg";

const AccessibilitySection = () => {
  const features = [
    {
      icon: Wifi,
      title: "Works with low internet",
      description: "Optimized for slow connections",
    },
    {
      icon: Sparkles,
      title: "No technical skills required",
      description: "Simple and intuitive for everyone",
    },
    {
      icon: Globe,
      title: "Local languages friendly",
      description: "Communicate in your language",
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
                Designed for Africa
              </span>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight text-balance">
                Simple. Affordable. Accessible.
              </h2>
              
              <p className="text-lg text-muted-foreground">
                Built for real life, not theory. Rabotka works the way you work.
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
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
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
              alt="Vibrant African community neighborhood"
              className="w-full h-auto object-cover aspect-[16/10]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccessibilitySection;
