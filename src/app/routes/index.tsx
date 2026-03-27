  import { Routes, Route } from "react-router";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/onboarding";
import Profile from "@/pages/profile";
import Login from "@/pages/login";
import VerifyWhatsApp from "@/pages/verify-whatsapp";
import Claims from "@/pages/claims";
import Claim from "@/pages/claim";
import CreateClaim from "@/pages/create-claim";
import { AuthGuard } from "@/components/auth";
import { LandingLayout, AppLayout } from "@/features/landing/layouts";
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
            <AppLayout>
              <Profile />
            </AppLayout>
          </AuthGuard>
        }
      />
      <Route
        path="/claims"
        element={
          <AuthGuard>
            <AppLayout>
              <Claims />
            </AppLayout>
          </AuthGuard>
        }
      />
      <Route
        path="/claims/new"
        element={
          <AuthGuard>
            <AppLayout>
              <CreateClaim />
            </AppLayout>
          </AuthGuard>
        }
      />
      <Route
        path="/claims/:id"
        element={
          <AuthGuard>
            <AppLayout>
              <Claim />
            </AppLayout>
          </AuthGuard>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/verify/whatsapp" element={<VerifyWhatsApp />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
