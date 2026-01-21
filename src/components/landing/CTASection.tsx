import { Button } from "@/components/ui/button";
import { MessageCircle, Users, ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 lg:py-32 bg-whatsapp-light">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-whatsapp shadow-glow mb-4">
            <MessageCircle className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Commencez aujourd'hui, sur WhatsApp
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Que vous cherchiez du travail ou de l'aide, Rabotka rend les choses simples. Rejoignez les milliers de personnes déjà connectées.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button variant="hero" size="lg" className="group">
              <MessageCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
              Rejoindre Rabotka comme Travailleur
              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="hero-outline" size="lg" className="group">
              <Users className="w-5 h-5 transition-transform group-hover:scale-110" />
              Trouver un Travailleur Maintenant
              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
