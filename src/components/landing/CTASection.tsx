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
            Start today, inside WhatsApp
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Whether you're looking for work or looking for help, Rabotka makes it simple. Join thousands already connected.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button variant="hero" size="lg" className="group">
              <MessageCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
              Join Rabotka as a Worker
              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="hero-outline" size="lg" className="group">
              <Users className="w-5 h-5 transition-transform group-hover:scale-110" />
              Find a Worker Now
              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
