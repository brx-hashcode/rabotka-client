import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageCircle, Menu, X } from "lucide-react";
import { useScroll } from "@/hooks/use-scroll";
import { navLinks } from "@/content/landing/navigation";
import { headerContent } from "@/content/landing/header";
import rabotkaLogo from "@/assets/rabotka-logo.png";
import { Link, useLocation, useNavigate } from "react-router";
import { LoginButton } from "@/features/landing/components/login-button";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isScrolled = useScroll(50);
  const location = useLocation();
  const navigate = useNavigate();

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

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      setIsMenuOpen(false);
      const id = href.slice(1);

      if (location.pathname === "/") {
        scrollToElement(id);
      } else {
        navigate("/");
        setTimeout(() => scrollToElement(id), 150);
      }
    } else {
      setIsMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border/50"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="section-container">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={rabotkaLogo}
              alt={headerContent.logo.alt}
              className="w-10 h-10 object-contain mix-blend-multiply"
            />
            <span className="font-display text-xl font-bold text-foreground">
              {headerContent.logo.brandName}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:block">
            <LoginButton />
          </div>

          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={headerContent.menu.openLabel}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden border-b ${
              isScrolled
                ? "bg-background border-border"
                : "bg-background/95 backdrop-blur-lg border-border/50"
            }`}
          >
            <div className="section-container py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-foreground font-medium py-2"
                  onClick={(e) => handleNavClick(e, link.href)}
                >
                  {link.label}
                </a>
              ))}
              <Button
                variant="whatsapp"
                size="default"
                className="w-full"
                asChild
              >
                <Link to="/onboarding">
                  <MessageCircle className="w-4 h-4" />
                  {headerContent.cta.button}
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
