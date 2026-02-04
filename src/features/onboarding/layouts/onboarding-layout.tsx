import rabotkaLogo from "@/assets/rabotka-logo.png";
import { Link } from "react-router";
import { layoutContent } from "@/content/onboarding";

interface OnboardingLayoutProps {
  readonly children: React.ReactNode;
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const footerText = layoutContent.footer.copyright.replace(
    "{year}",
    new Date().getFullYear().toString()
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="flex justify-center pt-8 pb-4">
        <Link to="/">
          <img
            src={rabotkaLogo}
            alt="Logo Rabotka"
            className="h-16 w-auto object-contain"
          />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center">
        {children}
      </main>

      <footer className="text-center py-6 text-gray-600 text-sm">
        {footerText}
      </footer>
    </div>
  );
}
