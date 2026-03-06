import Navbar from "../components/Navbar";
import HeroSection from "../components/landing/HeroSection";
import ScrollSection from "../components/landing/ScrollSection";
import { LanguageProvider } from "../contexts/LanguageContext";

export default function Landing(): JSX.Element {
  return (
    <LanguageProvider>
      <div>
        <Navbar />
        <HeroSection />
        <ScrollSection />
      </div>
    </LanguageProvider>
  );
}