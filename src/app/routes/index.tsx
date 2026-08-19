import { Routes, Route, useLocation } from "react-router";
import { lazy, Suspense, useEffect } from "react";
import { AuthGuard } from "@/components/auth";
import { AppShell, PublicShell } from "@/features/navigation";

import NotFound from "@/pages/not-found";

// The marketing site is lazy like every other route. Imported eagerly it pulled
// all 22 landing sections (and framer-motion, and the layout's Header/Footer)
// into the entry chunk, so every signed-in user paid for the whole landing page
// before /home could render — the worst possible trade on the mobile
// connections this app runs over.
const LandingLayout = lazy(() =>
  import("@/features/landing/layouts").then((m) => ({
    default: m.LandingLayout,
  })),
);
const Index = lazy(() => import("@/pages/Index"));
const Onboarding = lazy(() => import("@/pages/onboarding"));

const Profile = lazy(() => import("@/pages/profile"));
const MyPortfolio = lazy(() => import("@/pages/my-portfolio"));
const Login = lazy(() => import("@/pages/login"));
const Terms = lazy(() => import("@/pages/terms"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Cookies = lazy(() => import("@/pages/cookies"));
const VerifyWhatsApp = lazy(() => import("@/pages/verify-whatsapp"));
const Pay = lazy(() => import("@/pages/pay"));
const AdRedirect = lazy(() => import("@/pages/ad-redirect"));
const LoginLink = lazy(() => import("@/pages/login-link"));
const PublicPortfolio = lazy(() => import("@/pages/public-portfolio"));
const RealizationDetail = lazy(() => import("@/pages/realization-detail"));
const EmployerDashboard = lazy(() => import("@/pages/employer-dashboard"));
const ContactedProfiles = lazy(() => import("@/pages/contacted-profiles"));
const CreateJobOffer = lazy(() => import("@/pages/create-job-offer"));
const Claim = lazy(() => import("@/pages/claim"));
const CreateClaim = lazy(() => import("@/pages/create-claim"));
const OnboardingAvatar = lazy(() => import("@/pages/onboarding-avatar"));
const OnboardingSuccess = lazy(() => import("@/pages/onboarding-success"));
const OnboardingError = lazy(() => import("@/pages/onboarding-error"));

const Home = lazy(() => import("@/pages/home"));
const Applications = lazy(() => import("@/pages/applications"));
const WorkerMissionDetail = lazy(() => import("@/pages/worker-mission-detail"));
const WorkerApplications = lazy(() => import("@/pages/worker-applications"));
const WorkerMissionPayment = lazy(
  () => import("@/pages/worker-mission-payment"),
);
const JobDetailWorker = lazy(() => import("@/pages/job-detail-worker"));
const SavedJobs = lazy(() => import("@/pages/saved-jobs"));
const WalletTopUp = lazy(() => import("@/pages/wallet-top-up"));
const Jobs = lazy(() => import("@/pages/jobs"));
const Missions = lazy(() => import("@/pages/missions"));
const MissionDetail = lazy(() => import("@/pages/mission-detail"));
const ReceivedApplications = lazy(() => import("@/pages/received-applications"));
const ApplicationDetail = lazy(() => import("@/pages/application-detail"));
const ApplicationPayment = lazy(() => import("@/pages/application-payment"));
const PenaltiesPayment = lazy(() => import("@/pages/penalties-payment"));
const JobSearch = lazy(() => import("@/pages/job-search"));
const RecommendedWorkerDetail = lazy(
  () => import("@/pages/recommended-worker-detail"),
);
const RecommendationContact = lazy(
  () => import("@/pages/recommendation-contact"),
);
const WorkerSearch = lazy(() => import("@/pages/worker-search"));
const Claims = lazy(() => import("@/pages/claims"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function ScrollToTopOnNavigate() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function AppRoutes() {
  return (
    <>
      <ScrollToTopOnNavigate />
      <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<PageLoader />}>
            <LandingLayout>
              <Index />
            </LandingLayout>
          </Suspense>
        }
      />
      <Route
        path="/onboarding"
        element={
          <Suspense fallback={<PageLoader />}>
            <Onboarding />
          </Suspense>
        }
      />
      <Route
        path="/home"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <Home />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/applications"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <Applications />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/applications/:id"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <WorkerMissionDetail />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/mes-candidatures"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <WorkerApplications />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/offres/:id"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <JobDetailWorker />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/favoris"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <SavedJobs />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/portefeuille"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <WalletTopUp />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/jobs"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <Jobs />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/missions"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <Missions />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/missions/:id"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <MissionDetail />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/candidatures"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <ReceivedApplications />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/candidatures/:id"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <ApplicationDetail />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/candidatures/:id/paiement"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              {/* Focused payment flow — no tab bar, like /pay/:token. */}
              <AppShell withNav={false}>
                <ApplicationPayment />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/applications/:id/paiement"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              {/* Focused payment flow — no tab bar, like /pay/:token. */}
              <AppShell withNav={false}>
                <WorkerMissionPayment />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/penalites/paiement"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              {/* Focused payment flow — no tab bar, like /pay/:token. */}
              <AppShell withNav={false}>
                <PenaltiesPayment />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/recommandations/:workerId"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <RecommendedWorkerDetail />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/recommandations/:workerId/contact"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              {/* Focused payment flow — no tab bar, like /pay/:token. */}
              <AppShell withNav={false}>
                <RecommendationContact />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/recherche"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <WorkerSearch />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      {/* Worker-side counterpart of /recherche: searches offers, not workers. */}
      <Route
        path="/recherche-offres"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <JobSearch />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/profile"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <Profile />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/profile/portfolio"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <MyPortfolio />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/profile/portfolio/:itemId"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <RealizationDetail />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/claims"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <Claims />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/claims/new"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <CreateClaim />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/claims/:id"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              {/* Full-screen conversation, like a WhatsApp chat — no tab bar. */}
              <AppShell withNav={false}>
                <Claim />
              </AppShell>
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
        path="/profils-contactes"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <ContactedProfiles />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/dashboard"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <EmployerDashboard />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/job-offers/new"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <CreateJobOffer />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/job-offers/:id"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <MissionDetail />
              </AppShell>
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
        path="/s/:code"
        element={
          <Suspense fallback={<PageLoader />}>
            <LoginLink />
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
            <PublicShell>
              <PublicPortfolio />
            </PublicShell>
          </Suspense>
        }
      />
      {/* Public, like the portfolio it belongs to — no AuthGuard. */}
      <Route
        path="/p/:slug/r/:itemId"
        element={
          <Suspense fallback={<PageLoader />}>
            <PublicShell>
              <RealizationDetail />
            </PublicShell>
          </Suspense>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  );
}
