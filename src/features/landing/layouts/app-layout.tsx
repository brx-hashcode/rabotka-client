import { Header } from "../components/header";
import { ScrollToTop } from "../components/scroll-to-top";
import { useIsMobile } from "@/hooks/use-mobile";

type AppLayoutProps = {
  readonly children: React.ReactNode;
};

export function AppLayout({ children }: Readonly<AppLayoutProps>) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background w-full">
      <Header />
      <main className="w-full">{children}</main>
      {!isMobile && <ScrollToTop />}
    </div>
  );
}
