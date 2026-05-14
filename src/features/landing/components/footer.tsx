import { MapPin, Mail, Phone } from "lucide-react";
import { footerLinks, footerContent } from "@/content/landing/footer";
import rabotkaLogo from "@/assets/rabotka-logo.png?format=webp";
import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import { usePublicContact } from "@/hooks/use-public-contact";
import type { PublicContactInfo } from "@/lib/api/system-config-controller";

function ContactSkeleton() {
  const contactIcons = [
    { key: "address", Icon: MapPin },
    { key: "email", Icon: Mail },
    { key: "phone", Icon: Phone },
  ] as const;

  return (
    <div className="space-y-3">
      {contactIcons.map(({ key, Icon }) => (
        <div key={key} className="flex items-center gap-3">
          <Icon size={16} className="text-background/30 shrink-0" />
          <div className="h-3.5 w-40 rounded bg-background/15 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function Footer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: contact, isLoading } = usePublicContact();
  const contactInfo = contact as PublicContactInfo | undefined;

  const scrollToElement = useCallback((id: string, retries = 5) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    } else if (retries > 0) {
      setTimeout(() => scrollToElement(id, retries - 1), 100);
    }
  }, []);

  const handleFooterNav = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (href.startsWith("#")) {
        e.preventDefault();
        const id = href.slice(1);
        if (location.pathname === "/") {
          scrollToElement(id);
        } else {
          navigate("/");
          setTimeout(() => scrollToElement(id), 150);
        }
      } else if (href.startsWith("/")) {
        e.preventDefault();
        navigate(href);
      }
    },
    [location.pathname, navigate, scrollToElement],
  );

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

            {isLoading ? (
              <ContactSkeleton />
            ) : (
              <div className="space-y-3">
                {contactInfo?.phone && (
                  <div className="flex items-center gap-3 text-sm text-background/70">
                    <Phone size={16} className="shrink-0" />
                    <a
                      href={`tel:${contactInfo.phone}`}
                      rel="noopener noreferrer"
                      className="hover:text-background transition-colors hover:underline"
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                )}
                {contactInfo?.email && (
                  <div className="flex items-center gap-3 text-sm text-background/70">
                    <Mail size={16} className="shrink-0" />
                    <a
                      href={`mailto:${contactInfo.email}`}
                      rel="noopener noreferrer"
                      className="hover:text-background transition-colors hover:underline"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                )}

                {contactInfo?.address && (
                  <div className="flex items-center gap-3 text-sm text-background/70">
                    <MapPin size={16} className="shrink-0" />
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-background transition-colors hover:underline"
                    >
                      {contactInfo.address}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={`${title}-${link.label}`}>
                    <a
                      href={link.href}
                      onClick={(e) => handleFooterNav(e, link.href)}
                      className="text-background/70 hover:text-background transition-colors text-sm"
                    >
                      {link.label}
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
            © {new Date().getFullYear()} Rabotka (Работка). Tous droits
            réservés.
          </p>
          <div className="flex gap-6">
            {footerContent.socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-background/50 hover:text-background transition-colors"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
