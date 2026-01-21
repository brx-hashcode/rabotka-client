import { TrendingUp, Heart, Users } from "lucide-react";
import workersTogetherImage from "@/assets/workers-together.jpg";

const ImpactSection = () => {
  const impacts = [
    {
      icon: TrendingUp,
      text: "Autonomise les travailleurs informels",
    },
    {
      icon: Heart,
      text: "Réduit les frictions du chômage",
    },
    {
      icon: Users,
      text: "Soutient les familles et les communautés",
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative rounded-3xl overflow-hidden shadow-medium">
            <img
              src={workersTogetherImage}
              alt="Groupe de travailleurs africains divers souriant ensemble"
              className="w-full h-auto object-cover aspect-[16/10]"
            />
          </div>

          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-block px-4 py-2 rounded-full bg-whatsapp-light text-whatsapp-dark text-sm font-medium">
                Impact Social
              </span>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight text-balance">
                Créer des opportunités là où ça compte
              </h2>
            </div>

            <div className="space-y-4">
              {impacts.map((impact) => (
                <div
                  key={impact.text}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-whatsapp-light"
                >
                  <div className="w-10 h-10 rounded-xl bg-whatsapp flex items-center justify-center flex-shrink-0">
                    <impact.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <p className="font-semibold text-foreground">{impact.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
