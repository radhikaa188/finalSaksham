import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!CLERK_KEY) throw new Error('Missing Clerk Publishable Key');

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
        <Route path="/compare" element={<CareerComparePage />} /> {/* ← NEW */}
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