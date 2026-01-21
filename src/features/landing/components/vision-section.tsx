import { MapPin, ArrowRight } from "lucide-react";
import citySunsetImage from "@/assets/city-sunset.jpg";

export function VisionSection() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={citySunsetImage}
          alt="Horizon d'une ville africaine au coucher du soleil"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/80 to-foreground/60" />
      </div>

      <div className="section-container relative z-10">
        <div className="max-w-2xl">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-whatsapp/20 text-whatsapp-light text-sm font-medium">
              <MapPin className="w-4 h-4" />
              Notre Vision
            </div>
            
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight">
              Du Congo à l'Afrique
            </h2>
            
            <p className="text-xl text-primary-foreground/80">
              En commençant par Brazzaville, Rabotka vise à s'étendre à travers l'Afrique centrale et au-delà — connectant des millions de personnes aux opportunités.
            </p>

            <div className="flex items-center gap-2 text-whatsapp font-medium pt-4">
              <span>Rejoignez le mouvement</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
