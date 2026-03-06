import { Moon, Sun, Languages } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLang } from '../contexts/LanguageContext';
// import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang } = useLang();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-gray-950/70 backdrop-blur-lg border-b border-black/5 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div className="flex flex-col">
              <span className="font-outfit font-bold text-lg bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Saksham
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400 -mt-1">
                AI Career Guide
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLang}
              className="p-2.5 rounded-lg bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm hover:shadow-md"
              aria-label="Toggle Language"
            >
              <div className="flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {lang === 'en' ? 'EN' : 'हि'}
                </span>
              </div>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm hover:shadow-md"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* --- Clerk Auth (uncomment when VITE_CLERK_PUBLISHABLE_KEY is set) ---
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 text-white font-medium hover:shadow-lg transition-all">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <Link
                to="/profile"
                className="p-2.5 rounded-lg bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm hover:shadow-md"
                aria-label="Profile"
              >
                <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            --- End Clerk Auth --- */}

            {/* Temporary profile link (remove when Clerk is enabled) */}
            <Link
              to="/profile"
              className="p-2.5 rounded-lg bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm hover:shadow-md"
              aria-label="Profile"
            >
              <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}