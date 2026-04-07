import { useClerk, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useLang } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";
import { TextClipPathReveal } from "../Textclippathreveal";
// ─── CONFIG ──────────────────────────────────────────────────────────────────
const TOTAL_FRAMES = 200;
const FRAME_FOLDER = "ezgif-5e02c9ce15e369d8-jpg";
const FRAME_PREFIX = "ezgif-frame-";
const FRAME_EXT = ".jpg";
const SCROLL_HEIGHT = "300vh";

const getFrameSrc = (index: number): string => {
  const num = String(index + 1).padStart(3, "0");
  return `/${FRAME_FOLDER}/${FRAME_PREFIX}${num}${FRAME_EXT}`;
};

export default function HeroSection(): JSX.Element {
  const outerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const frameIndex = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const [textVisible, setTextVisible] = useState<boolean>(false);
  const [hasScrolled, setHasScrolled] = useState<boolean>(false);
  const { lang } = useLang();
  const { theme } = useTheme();
  const isDark = theme === "dark";

   const { openSignIn } = useClerk();
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  const handleEnterFuture = () => {
    if (isSignedIn) navigate("/start");
    else openSignIn({ redirectUrl: "/start" });
  };

  // ── Preload frames ────────────────────────────────────────────────────────
  useEffect(() => {
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new window.Image();
      img.src = getFrameSrc(i);
    }
    const t = setTimeout(() => setTextVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  // ── Section-relative scroll → frame ──────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const outer = outerRef.current;
        if (!outer || !imgRef.current) return;

        const scrolled = window.scrollY - outer.offsetTop;
        const scrollable = outer.offsetHeight - window.innerHeight;
        const progress = Math.min(Math.max(scrolled / scrollable, 0), 1);
        const newIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES));
        
        if (window.scrollY > 20) {
          setHasScrolled(true);
        } else {
          setHasScrolled(false);
        }

        if (newIndex !== frameIndex.current) {
          frameIndex.current = newIndex;
          imgRef.current.src = getFrameSrc(newIndex);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Letters for the big animated title
  const enLetters: string[] = ["S", "a", "k", "s", "h", "a", "m"];
  const hiLetters: string[] = ["स", "क्", "ष", "म"];
  const letters: string[] = lang === "en" ? enLetters : hiLetters;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@400;500;600&family=Noto+Sans+Devanagari:wght@400;500;600&display=swap');

        .hero-letter {
          display: inline-block;
          opacity: 0;
          transform: translateY(70px);
          transition: opacity 0.65s cubic-bezier(.16,1,.3,1),
                      transform 0.65s cubic-bezier(.16,1,.3,1);
        }
                      .hero-letter {
  display: inline-block;
  opacity: 0;
  transform: translateY(70px);
  transition: opacity 0.65s cubic-bezier(.16,1,.3,1),
              transform 0.65s cubic-bezier(.16,1,.3,1),
              color 0.3s ease,
              text-shadow 0.3s ease;
  cursor: default;
}
.hero-letter.in {
  opacity: 1;
  transform: translateY(0);
}
h1:hover .hero-letter.in {
  color: #ff7a3d;
  text-shadow: 0 0 40px rgba(255, 122, 61, 0.6);
  transform: translateY(-6px);
}
        .hero-letter.in {
          opacity: 1;
          transform: translateY(0);
        }

        .fade-up {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 1s ease, transform 1s ease;
        }
        .fade-up.in {
          opacity: 1;
          transform: translateY(0);
        }

        .line-draw {
          height: 1px;
          width: 0;
          background: #ff7a3d;
          margin: 0 auto;
          transition: width 1.1s cubic-bezier(.16,1,.3,1);
        }
        .line-draw.in { width: 72px; }

        .cta-btn {
          position: relative;
          overflow: hidden;
          font-family: 'Jost', sans-serif;
          font-weight: 600;
          font-size: 0.72rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #fff;
          background: #f97316;
          border: none;
          padding: 14px 42px;
          border-radius: 99px;
          cursor: pointer;
          opacity: 0;
          transform: translateY(12px);
          transition: all 0.8s ease;
          box-shadow: 0 4px 15px rgba(249, 115, 22, 0.2);
        }
        .cta-btn.in {
          opacity: 1;
          transform: translateY(0);
        }
        .cta-btn:hover {
          background: #ea580c;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(249, 115, 22, 0.4);
        }
        .cta-btn span { position: relative; z-index: 1; }

        @keyframes bounce {
          0%,100% { transform: translateY(0); opacity: 0.4; }
          50%      { transform: translateY(7px); opacity: 1;   }
        }
        .scroll-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #ff7a3d;
          animation: bounce 1.9s ease-in-out infinite;
        }

        .hero-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(120px);
          z-index: 1;
          pointer-events: none;
          opacity: 0.15;
        }
      `}</style>

      <div
        ref={outerRef}
        style={{ position: "relative", height: SCROLL_HEIGHT, background: "var(--section-bg)" }}
      >
        <div
          className="sticky w-full overflow-hidden"
          style={{ top: 68, height: "calc(100vh - 68px)" }}
        >
          <img
            ref={imgRef}
            src={getFrameSrc(0)}
            alt="hero animation"
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "right center",
              userSelect: "none",
              pointerEvents: "none",
              zIndex: 0,
              display: "block",
              background: "transparent",
              opacity: 0.6,
            }}
          />

          <div
            className="absolute inset-0 z-[1] pointer-events-none transition-colors duration-500 bg-white/30 dark:bg-black/60"
          />

          <div className="hero-glow" style={{ top: '-10%', left: '-10%', background: '#1b1f3a' }} />
          <div className="hero-glow" style={{ bottom: '-10%', right: '-10%', background: '#40201a' }} />

          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center"
            style={{ zIndex: 10, padding: "0 24px" }}
          >
            {/* ── Eyebrow tag ── */}
            <div
              className={`fade-up ${textVisible ? "in" : ""} flex items-center gap-3 mb-7`}
              style={{ transitionDelay: "0.05s" }}
            >
              <div style={{ width: 26, height: 1, background: "#ff7a3d", opacity: 0.75 }} />
              <span style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.72rem",
                fontWeight: 600,
                letterSpacing: "0.2em",
                color: "#ff7a3d",
                textTransform: "uppercase",
              }}>
                {lang === "en" ? "India's Tech Renaissance" : "भारत का तकनीकी पुनर्जागरण"}
              </span>
              <div style={{ width: 26, height: 1, background: "#ff7a3d", opacity: 0.75 }} />
            </div>

            <h1
              className={`drop-shadow-md sm:drop-shadow-xl transition-colors duration-500 text-gray-900 dark:text-[#f5f5f7] ${
                lang === "en" 
                  ? "text-7xl sm:text-8xl md:text-9xl lg:text-[11rem]" 
                  : "text-6xl sm:text-7xl md:text-8xl lg:text-[9rem]"
              }`}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                lineHeight: 1,
                letterSpacing: lang === "en" ? "0.14em" : "0.08em",
                margin: 0,
              }}
            >
              {letters.map((letter: string, i: number) => (
                <span
                  key={`${lang}-${i}`}
                  className={`hero-letter ${textVisible ? "in" : ""}`}
                  style={{
                    transitionDelay: `${0.08 + i * 0.08}s`,
                    color: (lang === "en" && i >= 3) || (lang === "hi" && i >= 2) ? "#ff7a3d" : "inherit",
                  }}
                >
                  {letter}
                </span>
              ))}
            </h1>

            <div style={{ marginTop: 22, marginBottom: 22 }}>
              <div
                className={`line-draw ${textVisible ? "in" : ""}`}
                style={{ transitionDelay: "0.7s" }}
              />
            </div>

            {/* ── ✦ TextClipPathReveal for the subtitle ── */}
            {/* Replaces the old <p> fade-up with the clip-path reveal */}
            <TextClipPathReveal
              text={
                lang === "en"
                  ? "Empowering the next generation of builders."
                  : "नई पीढ़ी के निर्माताओं को सशक्त बनाना।"
              }
              revealDirection="bottom"
              duration={0.8}
              staggerDelay={0.15}
              color={isDark ? "#a0a3bd" : "#4b5563"}
              once={true}
              style={{
                fontFamily: lang === "hi"
                  ? "'Noto Sans Devanagari', sans-serif"
                  : "'Jost', sans-serif",
                fontWeight: 400,
                fontSize: lang === "hi"
                  ? "clamp(0.95rem, 1.4vw, 1.15rem)"
                  : "clamp(0.92rem, 1.3vw, 1.1rem)",
                letterSpacing: lang === "hi" ? "0.01em" : "0.05em",
                lineHeight: 1.85,
                maxWidth: 480,
                margin: "0 auto",
              }}
            />

            {/* ── ✦ TextClipPathReveal for the tagline below CTA ── */}
            {/* A second use: a multi-line supporting statement */}
            <div style={{ marginTop: 16, marginBottom: 8 }}>
              <TextClipPathReveal
                text={
                  lang === "en"
                    ? "Learn in your language.\nGrow at your own pace."
                    : "अपनी भाषा में सीखें।\nअपनी गति से बढ़ें।"
                }
                revealDirection="bottom"
                duration={0.7}
                staggerDelay={0.2}
                color={isDark ? "rgba(245,245,247,0.4)" : "rgba(17,24,39,0.6)"}
                once={true}
                style={{
                  fontFamily: lang === "hi"
                    ? "'Noto Sans Devanagari', sans-serif"
                    : "'Jost', sans-serif",
                  fontWeight: 400,
                  fontSize: "clamp(0.72rem, 1vw, 0.85rem)",
                  letterSpacing: lang === "hi" ? "0.01em" : "0.1em",
                  textTransform: lang === "en" ? "uppercase" : "none",
                  lineHeight: 2,
                  textAlign: "center",
                }}
              />
            </div>

            <div style={{ marginTop: 32 }}>
              <button
                className={`cta-btn ${textVisible ? "in" : ""}`}
                style={{ transitionDelay: "0.95s" }}
                onClick={handleEnterFuture}
              >
                <span>
                  {lang === "en" ? "Enter the Future" : "भविष्य में प्रवेश करें"}
                </span>
              </button>
            </div>

            <div
              className={`fade-up flex flex-col items-center gap-2 transition-opacity duration-500 ${textVisible && !hasScrolled ? "in opacity-100" : "opacity-0"}`}
              style={{
                position: "absolute",
                bottom: 28,
                left: "50%",
                transform: "translateX(-50%)",
                transitionDelay: textVisible && !hasScrolled ? "1.2s" : "0s",
                pointerEvents: textVisible && !hasScrolled ? "auto" : "none",
              }}
            >
              <span className="text-gray-700 dark:text-gray-400 transition-colors duration-500" style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
              }}>
                {lang === "en" ? "Scroll" : "स्क्रॉल"}
              </span>
              <div className="scroll-dot" />
            </div>

          </div>
        </div>
      </div>
    </>
  );
}