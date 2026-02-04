import rabotkaLogo from "@/assets/rabotka-logo.png";
import { Link } from "react-router";

interface OnboardingLayoutProps {
  readonly children: React.ReactNode;
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="flex justify-center pt-8 pb-4">
        <Link to="/">
          <img
            src={rabotkaLogo}
            alt="Logo Rabotka"
            className="h-12 w-auto object-contain"
          />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center">
        {children}
      </main>

      <footer className="text-center py-6 text-gray-600 text-sm">
        Copyright © {new Date().getFullYear()} Rabotka. All Right Reserved
      </footer>
    </div>
  );
}
