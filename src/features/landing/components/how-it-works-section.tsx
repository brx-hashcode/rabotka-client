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
          
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight">
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
                <h3 className="font-display font-semibold text-foreground">{step.title}</h3>
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

export function HowItWorksSection() {
  const workerSteps = [
    {
      icon: UserPlus,
      title: "Créez votre profil",
      description: "Ajoutez vos compétences, expérience et localisation",
    },
    {
      icon: ShieldCheck,
      title: "Vérification du profil",
      description: "Nous vérifions votre identité pour la confiance",
    },
    {
      icon: Link,
      title: "Rejoignez Rabotka sur WhatsApp",
      description: "Recevez un lien pour vous connecter à notre bot",
    },
    {
      icon: MessageCircle,
      title: "Recevez des opportunités d'emploi",
      description: "Recevez des offres correspondantes directement par chat",
    },
  ];

  const employerSteps = [
    {
      icon: UserPlus,
      title: "Soumettez votre besoin",
      description: "Aide ménagère, répétiteur, coiffeur, et plus encore",
    },
    {
      icon: ShieldCheck,
      title: "Vérification",
      description: "Nous vérifions votre demande pour la sécurité",
    },
    {
      icon: Link,
      title: "Rejoignez Rabotka sur WhatsApp",
      description: "Connectez-vous à notre assistant",
    },
    {
      icon: MessageCircle,
      title: "Recevez des profils correspondants",
      description: "Contactez les travailleurs directement via WhatsApp ou téléphone",
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="section-container space-y-24 lg:space-y-32">
        <FlowCard
          subtitle="Pour les Travailleurs"
          title="Comment ça marche pour les travailleurs"
          steps={workerSteps}
          image={workerSmilingImage}
          imageAlt="Travailleur souriant en utilisant son téléphone"
        />
        
        <FlowCard
          subtitle="Pour les Employeurs"
          title="Comment ça marche pour les employeurs"
          steps={employerSteps}
          image={familyHomeImage}
          imageAlt="Famille à la maison utilisant un smartphone"
          reversed
        />
      </div>
    </section>
  );
}
