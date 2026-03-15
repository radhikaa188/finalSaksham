import { useEffect } from 'react';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { UserProvider, useUserContext } from './contexts/UserContext';
import { CareerGuidePage } from './pages/CareerGuidePage';
import { ProfilePage } from './pages/ProfilePage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/Dashboard';
import Landing from './pages/Landing';
import AboutPage from './pages/AboutPage';
import ExperiencePage from './pages/ExperiencePage';
import Layout from './components/Layout';
import { CareerComparePage } from './pages/CareerComparePage';
import { stopSpeaking } from './utils/tts';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!CLERK_KEY) throw new Error('Missing Clerk Publishable Key');

// ── Global effects: ping backend on load, stop TTS on every route change ──────
function GlobalEffects() {
  const location = useLocation();

  // 1. Wake up Render backend the moment the app opens
  //    so it's ready before the user reaches the onboarding TTS call
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/ping`).catch(() => {});
  }, []);

  // 2. Stop all speech on ANY route change
  //    This prevents queued/delayed TTS from bleeding into the next page
  useEffect(() => {
    stopSpeaking();
  }, [location.pathname]);

  return null;
}

function SmartRedirect() {
  const { profile } = useUserContext();
  if (profile?.completedOnboarding) {
    return <Navigate to="/guide" replace />;
  }
  return <Navigate to="/onboarding" replace />;
}

function ProtectedPages() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/start" element={<SmartRedirect />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/guide" element={<CareerGuidePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/compare" element={<CareerComparePage />} />
      </Routes>
    </UserProvider>
  );
}

function ClerkProviderWithRoutes() {
  return (
    <ClerkProvider publishableKey={CLERK_KEY}>
      <div className="font-outfit">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/experience" element={<ExperiencePage />} />

          {/* All protected routes */}
          <Route
            path="/*"
            element={
              <>
                <SignedIn>
                  <ProtectedPages />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
        </Routes>
      </div>
    </ClerkProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <GlobalEffects />  {/* Must be inside BrowserRouter to use useLocation */}
      <ThemeProvider>
        <LanguageProvider>
          <Layout>
            <ClerkProviderWithRoutes />
          </Layout>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;