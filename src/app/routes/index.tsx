import { Routes, Route } from "react-router";
import { lazy, Suspense } from "react";
import { AuthGuard } from "@/components/auth";
import { LandingLayout, AppLayout } from "@/features/landing/layouts";
import Index from "@/pages/Index";

// Critical path — bundled with landing
import Onboarding from "@/pages/onboarding";
import NotFound from "@/pages/not-found";

// Non-critical — lazy loaded
const Profile = lazy(() => import("@/pages/profile"));
const MyPortfolio = lazy(() => import("@/pages/my-portfolio"));
const Login = lazy(() => import("@/pages/login"));
const Terms = lazy(() => import("@/pages/terms"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Cookies = lazy(() => import("@/pages/cookies"));
const VerifyWhatsApp = lazy(() => import("@/pages/verify-whatsapp"));
const Pay = lazy(() => import("@/pages/pay"));
const AdRedirect = lazy(() => import("@/pages/ad-redirect"));
const PublicPortfolio = lazy(() => import("@/pages/public-portfolio"));
const Claims = lazy(() => import("@/pages/claims"));
const EmployerDashboard = lazy(() => import("@/pages/employer-dashboard"));
const CreateJobOffer = lazy(() => import("@/pages/create-job-offer"));
const Claim = lazy(() => import("@/pages/claim"));
const CreateClaim = lazy(() => import("@/pages/create-claim"));
const OnboardingAvatar = lazy(() => import("@/pages/onboarding-avatar"));
const OnboardingSuccess = lazy(() => import("@/pages/onboarding-success"));
const OnboardingError = lazy(() => import("@/pages/onboarding-error"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

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
        element={<Onboarding />}
      />
      <Route
        path="/profile"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <Profile />
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/profile/portfolio"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppLayout>
                <MyPortfolio />
              </AppLayout>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/claims"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppLayout>
                <Claims />
              </AppLayout>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/claims/new"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppLayout>
                <CreateClaim />
              </AppLayout>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/claims/:id"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppLayout>
                <Claim />
              </AppLayout>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/terms"
        element={
          <Suspense fallback={<PageLoader />}>
            <LandingLayout>
              <Terms />
            </LandingLayout>
          </Suspense>
        }
      />
      <Route
        path="/privacy"
        element={
          <Suspense fallback={<PageLoader />}>
            <LandingLayout>
              <Privacy />
            </LandingLayout>
          </Suspense>
        }
      />
      <Route
        path="/cookies"
        element={
          <Suspense fallback={<PageLoader />}>
            <LandingLayout>
              <Cookies />
            </LandingLayout>
          </Suspense>
        }
      />
      <Route
        path="/dashboard"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <EmployerDashboard />
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/job-offers/new"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <CreateJobOffer />
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/login"
        element={
          <Suspense fallback={<PageLoader />}>
            <Login />
          </Suspense>
        }
      />
      <Route
        path="/onboarding/avatar"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <OnboardingAvatar />
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/onboarding/success"
        element={
          <Suspense fallback={<PageLoader />}>
            <OnboardingSuccess />
          </Suspense>
        }
      />
      <Route
        path="/onboarding/error"
        element={
          <Suspense fallback={<PageLoader />}>
            <OnboardingError />
          </Suspense>
        }
      />
      <Route
        path="/verify/whatsapp"
        element={
          <Suspense fallback={<PageLoader />}>
            <VerifyWhatsApp />
          </Suspense>
        }
      />
      <Route
        path="/pay/:token"
        element={
          <Suspense fallback={<PageLoader />}>
            <Pay />
          </Suspense>
        }
      />
      <Route
        path="/r/:hash"
        element={
          <Suspense fallback={<PageLoader />}>
            <AdRedirect />
          </Suspense>
        }
      />
      <Route
        path="/p/:slug"
        element={
          <Suspense fallback={<PageLoader />}>
            <PublicPortfolio />
          </Suspense>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
