import { MapPin, Mail, Phone } from "lucide-react";
import { footerLinks, contactInfo, footerContent } from "@/content/landing/footer";
import rabotkaLogo from "@/assets/rabotka-logo.png";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="section-container">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <img 
                src={rabotkaLogo} 
                alt="Logo Rabotka" 
                className="w-10 h-10 object-contain"
              />
              <span className="font-display font-bold text-xl">Rabotka</span>
            </div>
            <p className="text-background/70 mb-6 max-w-sm">
              {footerContent.brandDescription}
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-background/70">
                <MapPin size={16} />
                <span>{contactInfo.address}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-background/70">
                <Mail size={16} />
                <span>{contactInfo.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-background/70">
                <Phone size={16} />
                <span>{contactInfo.phone}</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-background/70 hover:text-background transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-background/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-background/50">
            © {new Date().getFullYear()} Rabotka (Padrabotka). Tous droits réservés.
          </p>
          <div className="flex gap-6">
            {footerContent.socialLinks.map((social) => (
              <a
                key={social}
                href="#"
                className="text-sm text-background/50 hover:text-background transition-colors"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
