import { UserPlus, ShieldCheck, Link, MessageCircle } from "lucide-react";
import workerSmilingImage from "@/assets/worker-smiling.jpg";
import familyHomeImage from "@/assets/family-home.jpg";

interface FlowProps {
  title: string;
  subtitle: string;
  steps: Array<{
    icon: React.ElementType;
    title: string;
    description: string;
  }>;
  image: string;
  imageAlt: string;
  reversed?: boolean;
}

const FlowCard = ({ title, subtitle, steps, image, imageAlt, reversed }: FlowProps) => {
  return (
    <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${reversed ? 'lg:flex-row-reverse' : ''}`}>
      {/* Content */}
      <div className={`space-y-8 ${reversed ? 'lg:order-2' : ''}`}>
        <div className="space-y-4">
          <span className="inline-block px-4 py-2 rounded-full bg-whatsapp-light text-whatsapp-dark text-sm font-medium">
            {subtitle}
          </span>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            {title}
          </h2>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="flex items-start gap-4 p-4 rounded-2xl bg-card shadow-soft"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-whatsapp text-primary-foreground font-bold flex-shrink-0">
                {index + 1}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image */}
      <div className={`relative ${reversed ? 'lg:order-1' : ''}`}>
        <div className="rounded-3xl overflow-hidden shadow-medium">
          <img
            src={image}
            alt={imageAlt}
            className="w-full h-auto object-cover aspect-[3/4] lg:aspect-[4/5]"
          />
        </div>
      </div>
    </div>
  );
};

const HowItWorksSection = () => {
  const workerSteps = [
    {
      icon: UserPlus,
      title: "Create a profile",
      description: "Add your skills, experience, and location",
    },
    {
      icon: ShieldCheck,
      title: "Profile verification",
      description: "We verify your identity for trust",
    },
    {
      icon: Link,
      title: "Join Rabotka on WhatsApp",
      description: "Receive a link to connect with our bot",
    },
    {
      icon: MessageCircle,
      title: "Get job opportunities",
      description: "Receive matching jobs directly in chat",
    },
  ];

  const employerSteps = [
    {
      icon: UserPlus,
      title: "Submit your need",
      description: "House help, tutor, hairdresser, and more",
    },
    {
      icon: ShieldCheck,
      title: "Verification",
      description: "We verify your request for safety",
    },
    {
      icon: Link,
      title: "Join Rabotka on WhatsApp",
      description: "Connect with our assistant",
    },
    {
      icon: MessageCircle,
      title: "Receive matched profiles",
      description: "Contact workers directly via WhatsApp or phone",
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="section-container space-y-24 lg:space-y-32">
        <FlowCard
          subtitle="For Workers"
          title="How it works for workers"
          steps={workerSteps}
          image={workerSmilingImage}
          imageAlt="Worker smiling while using phone"
        />
        
        <FlowCard
          subtitle="For Employers"
          title="How it works for employers"
          steps={employerSteps}
          image={familyHomeImage}
          imageAlt="Family at home using smartphone"
          reversed
        />
      </div>
    </section>
  );
};

export default HowItWorksSection;
