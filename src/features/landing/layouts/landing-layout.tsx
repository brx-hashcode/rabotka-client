import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { ScrollToTop } from "../components/scroll-to-top";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router";

type LandingLayoutProps = {
  readonly children: React.ReactNode;
};

export function LandingLayout({ children }: Readonly<LandingLayoutProps>) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const shouldShowScrollToTop = !isMobile || isLanding;

  return (
    // A column, so a short page stretches its content and the footer sits at
    // the bottom of the window instead of leaving empty space below it.
    <div className="theme-classic min-h-screen bg-background text-foreground flex w-full flex-col">
      <Header />
      <main className="w-full flex-1">{children}</main>
      <Footer />
      {shouldShowScrollToTop && <ScrollToTop />}
    </div>
  );
}
