import { createContext, useContext, useState, ReactNode } from "react";

// allowed language types
export type Language = "en" | "hi";

// context type with lang, setLang, toggleLang
interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "en";
  });

  // function to update language and save to localStorage
  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("language", newLang);
  };

  // toggle function
  const toggleLang = () => {
    const newLang = lang === "en" ? "hi" : "en";
    setLang(newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

// custom hook
export function useLang(): LanguageContextType {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLang must be used within LanguageProvider");
  }

  return context;
}