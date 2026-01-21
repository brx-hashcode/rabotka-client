import { MessageCircle, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 bg-foreground text-primary-foreground">
      <div className="section-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-whatsapp flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Rabotka</span>
          </div>

          {/* Tagline */}
          <p className="flex items-center gap-2 text-primary-foreground/70 text-center">
            Fait avec <Heart className="w-4 h-4 text-accent fill-accent" /> pour l'Afrique
          </p>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-primary-foreground/70">
            <a href="#" className="hover:text-primary-foreground transition-colors">
              Confidentialité
            </a>
            <a href="#" className="hover:text-primary-foreground transition-colors">
              Conditions
            </a>
            <a href="#" className="hover:text-primary-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary-foreground/10 text-center text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} Rabotka (Padrabotka). Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
