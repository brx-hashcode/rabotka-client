import { Button } from "@/components/ui/button";
import { MessageCircle, Users } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-background via-background to-whatsapp-light">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-whatsapp/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="section-container relative z-10 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="text-center lg:text-left space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-whatsapp-light text-whatsapp-dark text-sm font-medium">
                <MessageCircle className="w-4 h-4" />
                Plateforme d'emploi via WhatsApp
              </span>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight text-balance">
                Trouvez du travail. Trouvez de l'aide.{" "}
                <span className="text-whatsapp">Directement sur WhatsApp.</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                Rabotka connecte les travailleurs informels et les employeurs grâce à un assistant WhatsApp simple — sans application, sans complexité.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="lg" className="group">
                <MessageCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
                Trouver un emploi sur WhatsApp
              </Button>
              <Button variant="hero-outline" size="lg" className="group">
                <Users className="w-5 h-5 transition-transform group-hover:scale-110" />
                Trouver un travailleur sur WhatsApp
              </Button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-8 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-whatsapp animate-pulse-soft" />
                <span>Gratuit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-whatsapp animate-pulse-soft" />
                <span>Pas d'appli à télécharger</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-whatsapp animate-pulse-soft" />
                <span>Profils vérifiés</span>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-slide-in-right">
            <div className="relative rounded-3xl overflow-hidden shadow-medium">
              <img
                src={heroImage}
                alt="Femme africaine utilisant WhatsApp dans un marché vibrant"
                className="w-full h-auto object-cover aspect-[4/3]"
              />
              {/* Floating chat bubble */}
              <div className="absolute bottom-6 left-6 right-6 bg-card/95 backdrop-blur-sm rounded-2xl p-4 shadow-medium animate-float">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-whatsapp flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground text-sm">Rabotka Bot</p>
                    <p className="text-sm text-muted-foreground">
                      Bonjour ! J'ai trouvé 3 opportunités d'emploi près de chez vous. Voulez-vous les voir ?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
