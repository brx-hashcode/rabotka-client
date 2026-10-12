import { Routes, Route } from "react-router";
import { ScrollRestoration } from "@/app/scroll-restoration";
import { lazy, Suspense } from "react";
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
const DevelopersApiDocumentation = lazy(
  () => import("@/pages/developers-api-documentation"),
);
const Privacy = lazy(() => import("@/pages/privacy"));
const Cookies = lazy(() => import("@/pages/cookies"));
const VerifyWhatsApp = lazy(() => import("@/pages/verify-whatsapp"));
const Pay = lazy(() => import("@/pages/pay"));
const AdRedirect = lazy(() => import("@/pages/ad-redirect"));
const LoginLink = lazy(() => import("@/pages/login-link"));
const OAuthConsent = lazy(() => import("@/pages/oauth-consent"));
const IdentityCheck = lazy(() => import("@/pages/identity-check"));
const PublicPortfolio = lazy(() => import("@/pages/public-portfolio"));
const RealizationDetail = lazy(() => import("@/pages/realization-detail"));
const EmployerDashboard = lazy(() => import("@/pages/employer-dashboard"));
const ContactedProfiles = lazy(() => import("@/pages/contacted-profiles"));
const CreateJobOffer = lazy(() => import("@/pages/create-job-offer"));
const EditJobOffer = lazy(() => import("@/pages/edit-job-offer"));
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
const Notifications = lazy(() => import("@/pages/notifications"));
const AgentInvitation = lazy(() => import("@/pages/agent-invitation"));
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
const Discussions = lazy(() => import("@/pages/discussions"));
const Discussion = lazy(() => import("@/pages/discussion"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <>
      <ScrollRestoration />
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
            <PublicShell>
              <Onboarding />
            </PublicShell>
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
        path="/notifications"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <Notifications />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      {/* The link a Rabotka field agent sends after calling a worker. Guarded:
          a signed-out worker logs in and comes straight back here. */}
      <Route
        path="/invitations/:token"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <AgentInvitation />
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
        path="/discussions"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <Discussions />
              </AppShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/discussions/:id"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              {/* Full-screen thread, like the claim conversation next door:
                  the tab bar would eat the composer on a short screen. */}
              <AppShell withNav={false}>
                <Discussion />
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
      {/*
        The integration guide for "Login with Rabotka". The API's discovery
        document names this URL as `service_documentation`, so a partner's OIDC
        client points its developers here — it is part of the protocol surface,
        not a marketing page, and the path must not move without updating
        `oauth-discovery.controller.ts`.
      */}
      <Route
        path="/developers/api-documentation"
        element={
          <Suspense fallback={<PageLoader />}>
            <LandingLayout>
              <DevelopersApiDocumentation />
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
        path="/job-offers/:id/edit"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <AppShell>
                <EditJobOffer />
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
            <PublicShell>
              <Login />
            </PublicShell>
          </Suspense>
        }
      />
      {/*
        "Login with Rabotka". Reached only by a redirect from the API's
        /oauth/authorize, never linked from inside the app.

        Rendered bare — no AppShell, no PublicShell. This page is somebody
        else's login dialog, usually running in a ~480x720 popup opened by a
        partner site. Rabotka's app chrome would frame it as a page of this app,
        which it is not: the user is deciding whether to trust a third party,
        and every pixel of surrounding product furniture makes that decision
        harder to see. The page centres itself instead.

        Deliberately NOT behind AuthGuard: a visitor arriving from a partner
        site usually has no session yet, and this page's whole job is to
        establish one. AuthGuard would bounce them to /login, which loses the
        interaction id and with it the partner's authorization request.
      */}
      {/*
        Opened from the WhatsApp consent request. Signed in by the link's
        one-tap code; full-page and shell-less, like the login consent.
      */}
      <Route
        path="/identity-checks/:id"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <IdentityCheck />
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/oauth/consent"
        element={
          <Suspense fallback={<PageLoader />}>
            <OAuthConsent />
          </Suspense>
        }
      />
      <Route
        path="/onboarding/avatar"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthGuard>
              <PublicShell>
                <OnboardingAvatar />
              </PublicShell>
            </AuthGuard>
          </Suspense>
        }
      />
      <Route
        path="/onboarding/success"
        element={
          <Suspense fallback={<PageLoader />}>
            <PublicShell>
              <OnboardingSuccess />
            </PublicShell>
          </Suspense>
        }
      />
      <Route
        path="/onboarding/error"
        element={
          <Suspense fallback={<PageLoader />}>
            <PublicShell>
              <OnboardingError />
            </PublicShell>
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
            <PublicShell>
              <Pay />
            </PublicShell>
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
