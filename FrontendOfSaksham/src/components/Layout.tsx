import AnimatedThemeToggler from './AnimatedThemeToggler';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* Theme toggle — fixed position, shows on every page */}
      <div className="fixed top-4 right-4 z-50">
        <AnimatedThemeToggler
          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-black/10 dark:border-white/10 hover:scale-110 transition-all shadow-sm"
        />
      </div>
      {children}
    </div>
  );
}