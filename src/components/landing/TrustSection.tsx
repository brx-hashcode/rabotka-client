import { ShieldCheck, UserCheck, Users, Lock } from "lucide-react";

const TrustSection = () => {
  const trustFeatures = [
    {
      icon: UserCheck,
      title: "Profile verification",
      description: "Every profile is reviewed and verified",
    },
    {
      icon: Lock,
      title: "Identity checks",
      description: "Secure identity verification process",
    },
    {
      icon: Users,
      title: "Community-based trust",
      description: "Reviews and ratings from real users",
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-background relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-whatsapp/5 blur-3xl" />
      </div>

      <div className="section-container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-whatsapp-light mb-6">
            <ShieldCheck className="w-8 h-8 text-whatsapp-dark" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
            Built on trust
          </h2>
          
          <p className="text-lg text-muted-foreground">
            Designed to protect both workers and employers. Safety is at the core of everything we do.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {trustFeatures.map((feature) => (
            <div
              key={feature.title}
              className="text-center p-8 rounded-3xl bg-card shadow-soft hover:shadow-medium transition-all"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-whatsapp/10 mb-6">
                <feature.icon className="w-8 h-8 text-whatsapp" />
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
