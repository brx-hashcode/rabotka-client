import { Bot, UserCheck, MessageSquare, Phone } from "lucide-react";

const WhatIsRabotkaSection = () => {
  const features = [
    {
      icon: UserCheck,
      title: "Creates worker profiles",
      description: "Build your professional identity",
    },
    {
      icon: Bot,
      title: "Matches jobs and skills",
      description: "AI-powered matching",
    },
    {
      icon: MessageSquare,
      title: "Suggests trusted profiles",
      description: "Verified recommendations",
    },
    {
      icon: Phone,
      title: "Enables direct contact",
      description: "Via WhatsApp or phone",
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-whatsapp-light">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-whatsapp/10 text-whatsapp-dark text-sm font-medium mb-4">
            What is Rabotka
          </span>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
            Your personal job assistant
          </h2>
          
          <p className="text-lg text-muted-foreground">
            Rabotka is an AI-powered assistant that connects workers with opportunities and employers with trusted help — all through WhatsApp.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-card rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-whatsapp/10 flex items-center justify-center mb-4 group-hover:bg-whatsapp/20 transition-colors">
                <feature.icon className="w-7 h-7 text-whatsapp-dark" />
              </div>
              
              <h3 className="font-bold text-foreground text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatIsRabotkaSection;
