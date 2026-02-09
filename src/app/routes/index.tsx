import { Routes, Route } from "react-router";
import Index from "@/pages/index";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/onboarding";
import Profile from "@/pages/profile";
import ProfilePenalties from "@/pages/profile-penalties";
import ProfileApplications from "@/pages/profile-applications";
import ProfileEdit from "@/pages/profile-edit";
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
              <Profile />
            </LandingLayout>
          </AuthGuard>
        }
      />
      <Route
        path="/profile/penalties"
        element={
          <AuthGuard>
            <LandingLayout>
              <ProfilePenalties />
            </LandingLayout>
          </AuthGuard>
        }
      />
      <Route
        path="/profile/applications"
        element={
          <AuthGuard>
            <LandingLayout>
              <ProfileApplications />
            </LandingLayout>
          </AuthGuard>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <AuthGuard>
            <LandingLayout>
              <ProfileEdit />
            </LandingLayout>
          </AuthGuard>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
