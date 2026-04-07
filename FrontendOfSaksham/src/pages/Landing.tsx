import Navbar from "../components/Navbar";
import HeroSection from "../components/landing/HeroSection";
import ScrollSection, { CTASection } from "../components/landing/ScrollSection";
import AboutSection from "../components/landing/AboutSection";
import { LanguageProvider } from "../contexts/LanguageContext";
import { ThemeProvider } from "../contexts/ThemeContext";

export default function Landing(): JSX.Element {
  return (
    <ThemeProvider>
    <LanguageProvider>
      <div style={{ background: "var(--section-bg)", minHeight: "100vh", transition: "background 0.4s ease" }}>
        <Navbar />
        <HeroSection />
        <ScrollSection />
        <div id="about">
          <AboutSection />
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-24">
          <CTASection />
        </div>
      </div>
    </LanguageProvider>
    </ThemeProvider>
  );
}