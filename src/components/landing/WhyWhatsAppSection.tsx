import { Smartphone, Download, Users } from "lucide-react";
import whatsappPhoneImage from "@/assets/whatsapp-phone.jpg";

const WhyWhatsAppSection = () => {
  const benefits = [
    {
      icon: Download,
      title: "Pas de nouvelle appli à télécharger",
      description: "Utilisez l'application que vous avez déjà",
    },
    {
      icon: Smartphone,
      title: "Fonctionne sur les téléphones basiques",
      description: "Optimisé pour tous les appareils",
    },
    {
      icon: Users,
      title: "Familier pour toutes les générations",
      description: "Facile à utiliser pour tout le monde",
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-block px-4 py-2 rounded-full bg-whatsapp-light text-whatsapp-dark text-sm font-medium">
                Pourquoi WhatsApp
              </span>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight text-balance">
                La plateforme que les gens utilisent déjà
              </h2>
              
              <p className="text-lg text-muted-foreground">
                WhatsApp fait déjà partie du quotidien. Rabotka rencontre les gens là où ils sont.
              </p>
            </div>

            <div className="grid gap-6">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-card shadow-soft transition-all hover:shadow-medium"
                >
                  <div className="w-12 h-12 rounded-xl bg-whatsapp-light flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-whatsapp-dark" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-medium max-w-sm mx-auto">
              <img
                src={whatsappPhoneImage}
                alt="Mains tenant un téléphone avec WhatsApp"
                className="w-full h-auto object-cover aspect-square"
              />
            </div>
            {/* Decorative */}
            <div className="absolute -z-10 inset-0 bg-whatsapp/10 rounded-3xl transform rotate-3" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyWhatsAppSection;
