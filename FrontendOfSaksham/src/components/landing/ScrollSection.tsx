import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../../contexts/LanguageContext";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface FeatureText {
  title: string;
  subtitle: string;
  body: string;
}

interface Feature {
  number: string;
  en: FeatureText;
  hi: FeatureText;
  accent: string;
  icon: string;
}

// ─── BILINGUAL FEATURES DATA ──────────────────────────────────────────────────
const featuresData: Feature[] = [
  {
    number: "01",
    en: {
      title: "Structured Learning Paths",
      subtitle: "Curated progression, not chaos.",
      body: "Every journey begins with clarity. Our hand-crafted learning paths remove the noise and guide you through exactly what matters — in the order that builds real mastery.",
    },
    hi: {
      title: "संरचित सीखने के रास्ते",
      subtitle: "अनुशासित प्रगति, अव्यवस्था नहीं।",
      body: "हर यात्रा स्पष्टता से शुरू होती है। हमारे सावधानी से बनाए गए सीखने के रास्ते अनावश्यक शोर को हटाते हैं और आपको सही क्रम में आगे ले जाते हैं।",
    },
    accent: "#ff7a3d",
    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  },
  {
    number: "02",
    en: {
      title: "Interactive Projects",
      subtitle: "Build things that speak for you.",
      body: "Theory without practice is decoration. Engage with real-world project challenges that translate your learning into a portfolio that quietly commands attention.",
    },
    hi: {
      title: "इंटरैक्टिव प्रोजेक्ट्स",
      subtitle: "ऐसी चीज़ें बनाएं जो आपकी पहचान हो।",
      body: "बिना अभ्यास के सिद्धांत केवल सजावट है। वास्तविक प्रोजेक्ट चुनौतियों से जुड़ें जो आपकी सीख को एक प्रभावशाली पोर्टफोलियो में बदल दें।",
    },
    accent: "#ff8c52",
    icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  },
  {
    number: "03",
    en: {
      title: "Smart Skill Assessment",
      subtitle: "Know exactly where you stand.",
      body: "Precision over assumption. Our adaptive assessments surface your strengths and gaps with surgical clarity — so you spend time on what actually moves the needle.",
    },
    hi: {
      title: "स्मार्ट कौशल मूल्यांकन",
      subtitle: "जानें आप वास्तव में कहाँ हैं।",
      body: "अनुमान नहीं, सटीकता। हमारे अनुकूली मूल्यांकन आपकी ताकत और कमियों को स्पष्ट रूप से उजागर करते हैं — ताकि आप सही जगह समय लगाएं।",
    },
    accent: "#ff7a3d",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    number: "04",
    en: {
      title: "Job & Internship Matching",
      subtitle: "Opportunity, intelligently placed.",
      body: "Stop scrolling job boards. We surface aligned opportunities the moment you're ready — matched to your skills, trajectory, and ambitions, not just keywords.",
    },
    hi: {
      title: "नौकरी और इंटर्नशिप मिलान",
      subtitle: "अवसर, बुद्धिमानी से।",
      body: "जॉब बोर्ड स्क्रॉल करना बंद करें। जैसे ही आप तैयार होते हैं, हम आपके कौशल और लक्ष्यों के अनुसार सही अवसर सामने लाते हैं।",
    },
    accent: "#ff8c52",
    icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  {
    number: "05",
    en: {
      title: "Progress Tracking",
      subtitle: "Growth made visible.",
      body: "A quiet record of how far you've come. Elegant dashboards that celebrate consistency, surface momentum, and make the invisible arc of your progress unmistakable.",
    },
    hi: {
      title: "प्रगति ट्रैकिंग",
      subtitle: "विकास को दृश्यमान बनाएं।",
      body: "आप कितना आगे आए हैं उसका एक शांत रिकॉर्ड। सुंदर डैशबोर्ड जो निरंतरता का जश्न मनाते हैं और आपकी प्रगति को अनदेखा नहीं होने देते।",
    },
    accent: "#ff7a3d",
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  },
  {
    number: "06",
    en: {
      title: "Mentor Support",
      subtitle: "The right voice at the right moment.",
      body: "Behind every breakthrough is a guiding presence. Connect with mentors who've walked the path — not coaches who recite frameworks, but people who genuinely know the way.",
    },
    hi: {
      title: "मेंटर सहायता",
      subtitle: "सही समय पर सही मार्गदर्शन।",
      body: "हर सफलता के पीछे एक मार्गदर्शक होता है। ऐसे मेंटर्स से जुड़ें जो वास्तव में यह रास्ता जानते हैं — सिर्फ ढांचे सुनाने वाले नहीं।",
    },
    accent: "#ff8c52",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
];

// ─── INJECT GOOGLE FONTS ──────────────────────────────────────────────────────
function useFonts(): void {
  useEffect(() => {
    if (document.getElementById("saksham-fonts")) return;
    const link = document.createElement("link");
    link.id = "saksham-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@300;400;500;600&family=Noto+Sans+Devanagari:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);
}

// ─── FEATURE CARD ─────────────────────────────────────────────────────────────
interface FeatureCardProps {
  feature: Feature;
  index: number;
}

function FeatureCard({ feature, index }: FeatureCardProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState<boolean>(false);
  const [hovered, setHovered] = useState<boolean>(false);
  const [mouseLocal, setMouseLocal] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const { lang } = useLang();

  const text: FeatureText = lang === "hi" ? feature.hi : feature.en;
  const bodyFont: string =
    lang === "hi" ? "'Noto Sans Devanagari', sans-serif" : "'Jost', sans-serif";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVis(true), index * 80);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouseLocal({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  // Stagger in 2 columns: left cards come from left, right from right
  const isRight = index % 2 !== 0;
  const translateX = isRight ? 40 : -40;

  return (
    <div
      ref={ref}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0) translateX(0)" : `translateY(40px) translateX(${translateX}px)`,
        transition: `all 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.07}s`,
        height: "100%",
      }}
    >
      <div
        className="feature-card"
        style={{
          position: "relative",
          overflow: "hidden",
          height: "100%",
          padding: "clamp(24px, 3vw, 40px)",
          background: hovered
            ? "rgba(255,255,255,0.07)"
            : "rgba(255,255,255,0.03)",
          border: `1px solid ${hovered ? "rgba(255,122,61,0.35)" : "rgba(255,255,255,0.07)"}`,
          borderRadius: "20px",
          transition: "all 0.4s ease",
          boxShadow: hovered
            ? `0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 40px rgba(255,122,61,0.08)`
            : "0 8px 32px rgba(0,0,0,0.2)",
          transform: hovered ? "translateY(-8px) scale(1.01)" : "none",
          cursor: "default",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Spotlight on hover */}
        {hovered && (
          <div
            style={{
              position: "absolute",
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(255,122,61,0.1) 0%, transparent 70%)`,
              top: `${mouseLocal.y - 50}%`,
              left: `${mouseLocal.x - 50}%`,
              pointerEvents: "none",
              zIndex: 0,
              transform: "translate(-50%, -50%)",
              transition: "none",
            }}
          />
        )}

        {/* Shimmer line at top on hover */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: hovered ? "0%" : "-100%",
            right: 0,
            height: "1px",
            background: "linear-gradient(90deg, transparent, #ff7a3d, transparent)",
            transition: "left 0.5s ease",
            zIndex: 1,
          }}
        />

        {/* Ghost number */}
        <div
          style={{
            position: "absolute",
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "9rem",
            fontWeight: 600,
            color: "#ff7a3d",
            opacity: hovered ? 0.08 : 0.04,
            top: "-20px",
            right: "8px",
            userSelect: "none",
            pointerEvents: "none",
            transition: "opacity 0.4s ease",
            lineHeight: 1,
          }}
        >
          {feature.number}
        </div>

        {/* Icon + number row */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 22,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                background: hovered
                  ? "rgba(255,122,61,0.15)"
                  : "rgba(255,122,61,0.08)",
                border: `1px solid ${hovered ? "rgba(255,122,61,0.4)" : "rgba(255,122,61,0.15)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
                boxShadow: hovered ? "0 0 20px rgba(255,122,61,0.2)" : "none",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ff7a3d"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={feature.icon} />
              </svg>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  letterSpacing: "0.22em",
                  color: "#ff7a3d",
                  textTransform: "uppercase",
                  opacity: 0.8,
                }}
              >
                {feature.number}
              </span>
              <div
                style={{
                  height: 1,
                  width: hovered ? 40 : 20,
                  background: "linear-gradient(90deg, #ff7a3d, transparent)",
                  opacity: 0.5,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>

          {/* Hover arrow */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "1px solid rgba(255,122,61,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: hovered ? 1 : 0,
              transform: hovered ? "translateX(0)" : "translateX(-10px)",
              transition: "all 0.3s ease",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="#ff7a3d" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3
          style={{
            position: "relative",
            zIndex: 1,
            fontFamily:
              lang === "hi"
                ? "'Noto Sans Devanagari', sans-serif"
                : "'Cormorant Garamond', serif",
            fontWeight: 500,
            fontSize: "clamp(1.4rem, 2vw, 1.8rem)",
            color: hovered ? "#ffffff" : "#f0f0f4",
            lineHeight: 1.2,
            marginBottom: 10,
            letterSpacing: lang === "hi" ? "0" : "-0.02em",
            transition: "color 0.3s ease",
          }}
        >
          {text.title}
        </h3>

        {/* Subtitle */}
        <p
          style={{
            position: "relative",
            zIndex: 1,
            fontFamily: bodyFont,
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "#ff7a3d",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: 16,
            opacity: 0.9,
          }}
        >
          {text.subtitle}
        </p>

        {/* Body */}
        <p
          style={{
            position: "relative",
            zIndex: 1,
            fontFamily: bodyFont,
            fontWeight: 300,
            fontSize: "0.92rem",
            lineHeight: 1.75,
            color: hovered ? "#b8bcd4" : "#878aac",
            margin: 0,
            transition: "color 0.3s ease",
          }}
        >
          {text.body}
        </p>

        {/* Bottom border glow */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "20%",
            right: "20%",
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(255,122,61,0.5), transparent)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
function SectionHeader(): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState<boolean>(false);
  const { lang } = useLang();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVis(true); observer.disconnect(); }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ textAlign: "center", marginBottom: 90 }}>
      {/* Pill */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
          padding: "8px 24px",
          border: "1px solid rgba(255,122,61,0.2)",
          borderRadius: "99px",
          background: "rgba(255,122,61,0.05)",
          opacity: vis ? 1 : 0,
          transform: vis ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s ease",
        }}
      >
        <div
          style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#ff7a3d",
            boxShadow: "0 0 8px rgba(255,122,61,0.8)",
          }}
        />
        <span
          style={{
            fontFamily: "'Jost', sans-serif",
            fontWeight: 600,
            fontSize: "0.72rem",
            letterSpacing: "0.3em",
            color: "#ff7a3d",
            textTransform: "uppercase",
          }}
        >
          {lang === "en" ? "Our Mission" : "हमारा लक्ष्य"}
        </span>
        <div
          style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#ff7a3d",
            boxShadow: "0 0 8px rgba(255,122,61,0.8)",
          }}
        />
      </div>

      {/* Heading with word-by-word reveal */}
      <h2
        style={{
          fontFamily:
            lang === "hi"
              ? "'Noto Sans Devanagari', sans-serif"
              : "'Cormorant Garamond', serif",
          fontWeight: 300,
          fontSize: "clamp(2.8rem, 6vw, 5rem)",
          color: "#f5f5f7",
          lineHeight: 1.05,
          letterSpacing: lang === "hi" ? "0" : "-0.03em",
          margin: 0,
          opacity: vis ? 1 : 0,
          transform: vis ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.9s cubic-bezier(.16,1,.3,1) 0.15s",
        }}
      >
        {lang === "en" ? (
          <>
            Future-Ready{" "}
            <span
              style={{
                fontStyle: "italic",
                color: "#ff7a3d",
                textShadow: "0 0 40px rgba(255,122,61,0.3)",
              }}
            >
              Intelligence
            </span>
          </>
        ) : (
          "भविष्य के लिए तैयार बुद्धिमत्ता"
        )}
      </h2>

      {/* Decorative line */}
      <div
        style={{
          margin: "28px auto 0",
          width: vis ? "80px" : "0px",
          height: "1px",
          background: "linear-gradient(90deg, transparent, #ff7a3d, transparent)",
          transition: "width 1.2s cubic-bezier(.16,1,.3,1) 0.4s",
          boxShadow: "0 0 6px rgba(255,122,61,0.5)",
        }}
      />

      {/* Supporting text */}
      <p
        style={{
          marginTop: 20,
          fontFamily: "'Jost', sans-serif",
          fontWeight: 300,
          fontSize: "clamp(0.9rem, 1.2vw, 1rem)",
          color: "rgba(160,163,189,0.7)",
          letterSpacing: "0.04em",
          opacity: vis ? 1 : 0,
          transform: vis ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.8s ease 0.35s",
        }}
      >
        {lang === "en"
          ? "Six pillars that transform ambition into achievement."
          : "छह स्तंभ जो महत्वाकांक्षा को उपलब्धि में बदलते हैं।"}
      </p>
    </div>
  );
}

// ─── CTA SECTION ─────────────────────────────────────────────────────────────
function CTASection(): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState<boolean>(false);
  const [hovered, setHovered] = useState<boolean>(false);
  const { lang } = useLang();
  const navigate = useNavigate();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVis(true); observer.disconnect(); }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        marginTop: 100,
        textAlign: "center",
        padding: "clamp(50px, 6vw, 90px) clamp(30px, 5vw, 60px)",
        background: "rgba(255,122,61,0.03)",
        borderRadius: "32px",
        border: "1px solid rgba(255,122,61,0.1)",
        position: "relative",
        overflow: "hidden",
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(40px)",
        transition: "all 1s cubic-bezier(.16,1,.3,1)",
      }}
    >
      {/* Background ambient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 100%, rgba(255,122,61,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Corner accents */}
      {[
        { top: 0, left: 0, br: "0 0 20px 0" },
        { top: 0, right: 0, br: "0 0 0 20px" },
        { bottom: 0, left: 0, br: "0 20px 0 0" },
        { bottom: 0, right: 0, br: "20px 0 0 0" },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            ...pos,
            width: 40,
            height: 40,
            border: "1px solid rgba(255,122,61,0.3)",
            borderRadius: pos.br,
          }}
        />
      ))}

      <h3
        style={{
          fontFamily:
            lang === "hi"
              ? "'Noto Sans Devanagari', sans-serif"
              : "'Cormorant Garamond', serif",
          fontWeight: 300,
          fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
          color: "#f5f5f7",
          marginBottom: 12,
          fontStyle: lang === "hi" ? "normal" : "italic",
          position: "relative",
          zIndex: 1,
        }}
      >
        {lang === "en" ? "Ready to shape tomorrow?" : "भविष्य को आकार देने के लिए तैयार हैं?"}
      </h3>

      <p
        style={{
          fontFamily: "'Jost', sans-serif",
          fontWeight: 300,
          fontSize: "0.9rem",
          color: "rgba(160,163,189,0.7)",
          letterSpacing: "0.04em",
          marginBottom: 40,
          position: "relative",
          zIndex: 1,
        }}
      >
        {lang === "en"
          ? "Join 50,000+ learners already on the path."
          : "50,000+ शिक्षार्थियों के साथ जुड़ें।"}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          position: "relative",
          zIndex: 1,
          flexWrap: "wrap",
        }}
      >
        <button
          style={{
            background: hovered
              ? "linear-gradient(135deg, #ff8c52 0%, #ff6a35 100%)"
              : "linear-gradient(135deg, #ff7a3d 0%, #ff5e2e 100%)",
            color: "white",
            fontFamily: "'Jost', sans-serif",
            fontWeight: 600,
            fontSize: "0.78rem",
            padding: "16px 52px",
            border: "none",
            borderRadius: "99px",
            boxShadow: hovered
              ? "0 20px 50px rgba(255,122,61,0.5), 0 0 0 6px rgba(255,122,61,0.1)"
              : "0 10px 30px rgba(255,122,61,0.25)",
            cursor: "pointer",
            textTransform: "uppercase" as const,
            letterSpacing: "0.16em",
            transform: hovered ? "translateY(-4px) scale(1.02)" : "translateY(0) scale(1)",
            transition: "all 0.4s cubic-bezier(.16,1,.3,1)",
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => navigate('/experience')}
        >
          {lang === "en" ? "Join the Renaissance" : "पुनर्जागरण में शामिल हों"}
        </button>

        <span
          style={{
            fontFamily: "'Jost', sans-serif",
            fontWeight: 300,
            fontSize: "0.78rem",
            color: "rgba(160,163,189,0.5)",
            letterSpacing: "0.06em",
          }}
        >
          {lang === "en" ? "No credit card required" : "कोई शुल्क नहीं"}
        </span>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function ScrollSection(): JSX.Element {
  useFonts();

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 6px rgba(255,122,61,0.6); }
          50% { box-shadow: 0 0 14px rgba(255,122,61,1), 0 0 28px rgba(255,122,61,0.4); }
        }
        @keyframes bgShift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.05); }
        }
        .bg-orb-1 { animation: bgShift 18s ease-in-out infinite; }
        .bg-orb-2 { animation: bgShift 22s ease-in-out infinite reverse; }

        .feature-card {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        @keyframes numberReveal {
          from { clip-path: inset(0 100% 0 0); }
          to { clip-path: inset(0 0% 0 0); }
        }
      `}</style>

      <section
        id="features"
        style={{
          background: "#080a14",
          padding: "clamp(80px, 10vw, 140px) 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background orbs */}
        <div
          className="bg-orb-1"
          style={{
            position: "absolute",
            top: "-15%",
            left: "-10%",
            width: "55%",
            height: "65%",
            background:
              "radial-gradient(circle, rgba(27, 31, 58, 0.5) 0%, transparent 70%)",
            filter: "blur(100px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <div
          className="bg-orb-2"
          style={{
            position: "absolute",
            bottom: "-15%",
            right: "-10%",
            width: "55%",
            height: "65%",
            background:
              "radial-gradient(circle, rgba(64, 32, 26, 0.5) 0%, transparent 70%)",
            filter: "blur(100px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {/* Subtle grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,122,61,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,122,61,0.04) 1px, transparent 1px)",
            backgroundSize: "100px 100px",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          <SectionHeader />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "clamp(16px, 2vw, 28px)",
            }}
          >
            {featuresData.map((feature: Feature, idx: number) => (
              <FeatureCard key={idx} feature={feature} index={idx} />
            ))}
          </div>

          <CTASection />
        </div>
      </section>
    </>
  );
}