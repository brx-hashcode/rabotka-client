import { Routes, Route } from "react-router";
import Index from "@/pages/index";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import { AuthGuard } from "@/components/auth";
import { LandingLayout } from "@/features/landing/layouts/landing-layout";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route
        path="/profile"
        element={
          <AuthGuard>
            <LandingLayout>
              <Dashboard />
            </LandingLayout>
          </AuthGuard>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
