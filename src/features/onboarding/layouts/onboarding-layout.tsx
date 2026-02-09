import rabotkaLogo from "@/assets/rabotka-logo.png";
import { Link } from "react-router";
import { layoutContent } from "@/content/onboarding";

type OnboardingLayoutProps = {
  readonly children: React.ReactNode;
};

export function OnboardingLayout({
  children,
}: Readonly<OnboardingLayoutProps>) {
  const footerText = layoutContent.footer.copyright.replace(
    "{year}",
    new Date().getFullYear().toString(),
  );

  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      <div
        className="hidden absolute inset-0 bg-size-[40px_40px] bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]"
        aria-hidden
      />
      <div
        className="hidden pointer-events-none absolute inset-0 bg-white mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]"
        aria-hidden
      />
      <div className="relative z-10 flex min-h-screen flex-1 flex-col">
        <header className="flex justify-center pt-8 pb-4">
          <Link to="/">
            <img
              src={rabotkaLogo}
              alt="Logo Rabotka"
              className="h-16 w-auto object-contain"
            />
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center">
          {children}
        </main>

        <footer className="text-center py-6 text-gray-600 text-sm">
          {footerText}
        </footer>
      </div>
    </div>
  );
}
