import { Smartphone, Download, Users } from "lucide-react";
import whatsappPhoneImage from "@/assets/whatsapp-phone.jpg";

const WhyWhatsAppSection = () => {
  const benefits = [
    {
      icon: Download,
      title: "No new app to download",
      description: "Use the app you already have",
    },
    {
      icon: Smartphone,
      title: "Works on low-end smartphones",
      description: "Optimized for any device",
    },
    {
      icon: Users,
      title: "Familiar to all generations",
      description: "Easy for everyone to use",
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
                Why WhatsApp
              </span>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight text-balance">
                The platform people already use
              </h2>
              
              <p className="text-lg text-muted-foreground">
                WhatsApp is already part of everyday life. Rabotka meets people where they already are.
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
                alt="Hands holding phone with WhatsApp chat"
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
