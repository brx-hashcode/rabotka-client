import { Phone, MessageCircle, ArrowRight } from "lucide-react";
import phoneConversationImage from "@/assets/phone-conversation.jpg";

const DirectContactSection = () => {
  return (
    <section className="py-20 lg:py-32 bg-secondary/30">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative rounded-3xl overflow-hidden shadow-medium">
            <img
              src={phoneConversationImage}
              alt="Two people having a friendly phone conversation"
              className="w-full h-auto object-cover aspect-[16/10]"
            />
          </div>

          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
                Direct Connection
              </span>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight text-balance">
                No middlemen. No barriers.
              </h2>
              
              <p className="text-lg text-muted-foreground">
                Once a match is found, you connect directly. Rabotka removes friction and builds trust.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-3 bg-card p-4 rounded-2xl shadow-soft flex-1">
                <div className="w-12 h-12 rounded-xl bg-whatsapp-light flex items-center justify-center">
                  <Phone className="w-6 h-6 text-whatsapp-dark" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Call directly</p>
                  <p className="text-sm text-muted-foreground">One tap to connect</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-card p-4 rounded-2xl shadow-soft flex-1">
                <div className="w-12 h-12 rounded-xl bg-whatsapp-light flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-whatsapp-dark" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Chat on WhatsApp</p>
                  <p className="text-sm text-muted-foreground">Message instantly</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-whatsapp font-medium">
              <span>Start connecting today</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DirectContactSection;
