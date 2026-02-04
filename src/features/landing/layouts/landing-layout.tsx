import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { ScrollToTop } from "../components/scroll-to-top";

type LandingLayoutProps = {
  readonly children: React.ReactNode;
};

export function LandingLayout({ children }: Readonly<LandingLayoutProps>) {
  return (
    <div className="min-h-screen bg-background w-full">
      <Header />
      <main className="w-full">{children}</main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
