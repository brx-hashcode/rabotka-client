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
    <div className="min-h-screen bg-background w-full">
      <Header />
      <main className="w-full">{children}</main>
      <Footer />
      {shouldShowScrollToTop && <ScrollToTop />}
    </div>
  );
}
