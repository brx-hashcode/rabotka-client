import { Routes, Route } from "react-router";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/onboarding";
import Profile from "@/pages/profile";
import Login from "@/pages/login";
import VerifyWhatsApp from "@/pages/verify-whatsapp";
import { AuthGuard } from "@/components/auth";
import { LandingLayout } from "@/features/landing/layouts/landing-layout";
import Index from "@/pages/Index";

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <LandingLayout>
            <Index />
          </LandingLayout>
        }
      />
      <Route
        path="/onboarding"
        element={
          <LandingLayout>
            <Onboarding />
          </LandingLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <AuthGuard>
            <LandingLayout>
              <Profile />
            </LandingLayout>
          </AuthGuard>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/verify/whatsapp" element={<VerifyWhatsApp />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
