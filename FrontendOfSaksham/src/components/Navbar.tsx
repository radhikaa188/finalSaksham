import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";
import { useClerk, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

interface RotatingNavItemProps {
  href: string;
  label: string;
  iconKey: string;
  onClick?: () => void;
  textColor?: string;
}

const ICONS: Record<string, React.ReactNode> = {
  features: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  ),
  about: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

const spring = { type: "spring" as const, bounce: 0.2, duration: 0.4 };

const RotatingNavItem: React.FC<RotatingNavItemProps> = ({ href, label, iconKey, onClick, textColor = "var(--text-primary)" }) => {
  const [hovered, setHovered] = useState(false);
  const isScroll = href.startsWith('#');

  const content = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
        cursor: "pointer",
        minWidth: 80,
        height: 44,
        overflow: "visible",
      }}
    >
      <motion.div
        animate={hovered ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <motion.svg
          viewBox="0 0 100 100"
          width="70"
          height="70"
          aria-hidden="true"
          animate={hovered ? { rotate: 360 } : { rotate: 0 }}
          transition={
            hovered
              ? { rotate: { duration: 5, ease: "linear", repeat: Infinity, repeatType: "loop" } }
              : { rotate: { duration: 0.4 } }
          }
        >
          <defs>
            <path
              id={`cp-${iconKey}`}
              d="M 50,50 m -28,0 a 28,28 0 1,1 56,0 a 28,28 0 1,1 -56,0"
            />
          </defs>
          <text
            fill="#ff7a3d"
            fontSize="10.5"
            fontFamily="'Jost', sans-serif"
            fontWeight="500"
            letterSpacing="2.5"
          >
            <textPath href={`#cp-${iconKey}`}>
              {label.toUpperCase()} • {label.toUpperCase()} •&nbsp;
            </textPath>
          </text>
        </motion.svg>
      </motion.div>

      <motion.span
        animate={hovered ? { y: "-120%", opacity: 0 } : { y: "0%", opacity: 1 }}
        transition={spring}
        style={{
          position: "absolute",
          fontFamily: "'Jost', sans-serif",
          fontSize: "0.78rem",
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: textColor,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </motion.span>

      <motion.span
        animate={hovered ? { y: "0%", opacity: 1 } : { y: "120%", opacity: 0 }}
        transition={spring}
        style={{
          position: "absolute",
          color: "#ff7a3d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {ICONS[iconKey]}
      </motion.span>
    </div>
  );

  const handleHashRouting = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('/#')) {
      const id = href.split('#')[1];
      const element = document.getElementById(id);
      if (element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', href);
      }
    }
    if (onClick) onClick();
  };

  return <Link to={href} onClick={handleHashRouting}>{content}</Link>;
};

interface CTAButtonProps {
  label: string;
  onClick: () => void;
  style?: React.CSSProperties;
}

const CTAButton: React.FC<CTAButtonProps> = ({ label, onClick, style }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={hovered ? { y: -1, backgroundColor: "#ea580c", boxShadow: "0 8px 25px rgba(249,115,22,0.4)" } : { y: 0, backgroundColor: "#f97316", boxShadow: "0 4px 15px rgba(249,115,22,0.2)" }}
      transition={{ duration: 0.3 }}
      style={{
        fontFamily: "'Jost', sans-serif",
        fontSize: "0.78rem",
        fontWeight: 600,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#fff",
        padding: "0 26px",
        borderRadius: "99px",
        border: "none",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        height: 40,
        minWidth: 120,
        ...style,
      }}
    >
      <motion.span
        animate={hovered ? { y: "-120%", opacity: 0 } : { y: "0%", opacity: 1 }}
        transition={spring}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </motion.span>

      <motion.span
        animate={hovered ? { y: "0%", opacity: 1 } : { y: "120%", opacity: 0 }}
        transition={spring}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </motion.span>

      <span style={{ visibility: "hidden", whiteSpace: "nowrap" }}>{label}</span>
    </motion.button>
  );
};

// ── Sun icon ──────────────────────────────────────────────────────────────────
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

// ── Moon icon ─────────────────────────────────────────────────────────────────
const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);



// ─────────────────────────────────────────────────────────────────────────────
// Navbar
// ─────────────────────────────────────────────────────────────────────────────
const Navbar: React.FC = (): JSX.Element => {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const { lang, setLang } = useLang();
  const { openSignIn } = useClerk();
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleGetStarted = () => {
    if (isSignedIn) navigate("/start");
    else openSignIn({ redirectUrl: "/start" });
  };

  // ── Theme-aware color tokens ───────────────────────────────────────────────
  const navBg = scrolled
    ? isDark
      ? "rgba(13, 15, 26, 0.85)"
      : "rgba(250, 249, 247, 0.88)"
    : "transparent";

  const borderColor = scrolled
    ? isDark
      ? "rgba(255,255,255,0.08)"
      : "rgba(0,0,0,0.08)"
    : "transparent";

  const mobileBg = isDark ? "rgba(13,15,26,0.98)" : "rgba(250,249,247,0.98)";
  const mobileBorder = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const textColor = isDark ? "#f5f5f7" : "#1a1a2e";
  const barColor = isDark ? "#f5f5f7" : "#1a1a2e";
  const dividerColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@400;500;600&family=Noto+Sans+Devanagari:wght@400;500;600&display=swap');

        .nav-lang-btn {
          font-family: 'Noto Sans Devanagari', 'Jost', sans-serif;
          font-size: 0.82rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          padding: 6px 14px;
          border: 1.5px solid rgba(255, 122, 61, 0.3);
          background: transparent;
          color: ${textColor};
          cursor: pointer;
          border-radius: 99px;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        .nav-lang-btn:hover {
          background: rgba(255, 122, 61, 0.1);
          border-color: #ff7a3d;
        }
        .mobile-menu {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(.16,1,.3,1);
        }
        .mobile-menu.open { max-height: 400px; }
        .mobile-nav-link {
          font-family: 'Jost', sans-serif;
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${textColor};
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .mobile-nav-link:hover { color: #ff7a3d; }
        .bar {
          display: block;
          width: 20px;
          height: 1.5px;
          background: ${barColor};
          transition: transform 0.35s ease, opacity 0.3s ease;
        }
        .bar-mid { margin: 5px 0; }
        .menu-open .bar-top  { transform: translateY(6.5px) rotate(45deg); }
        .menu-open .bar-mid  { opacity: 0; }
        .menu-open .bar-bot  { transform: translateY(-6.5px) rotate(-45deg); }

        .theme-toggle-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1.5px solid rgba(255, 122, 61, 0.3);
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff7a3d;
          transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          flex-shrink: 0;
        }
        .theme-toggle-btn:hover {
          background: rgba(255, 122, 61, 0.1);
          border-color: #ff7a3d;
          box-shadow: 0 0 12px rgba(255, 122, 61, 0.2);
        }
      `}</style>

      <nav
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 50,
          background: navBg,
          backdropFilter: scrolled ? "blur(14px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: `1px solid ${borderColor}`,
          transition: "all 0.4s ease",
          boxShadow: scrolled ? "0 10px 40px rgba(0,0,0,0.15)" : "none",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 clamp(20px, 5vw, 64px)",
            height: 68,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none" }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.55rem",
              fontWeight: 600,
              letterSpacing: "0.06em",
              color: textColor,
              lineHeight: 1,
              transition: "color 0.4s ease",
            }}>
              Sak
            </span>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.55rem",
              fontWeight: 400,
              fontStyle: "italic",
              letterSpacing: "0.06em",
              color: "#ff7a3d",
              lineHeight: 1,
            }}>
              sham
            </span>
          </Link>

          {/* ── Desktop ── */}
          <div className="hidden md:flex" style={{ alignItems: "center", gap: "clamp(4px, 2vw, 20px)" }}>
            <RotatingNavItem href="/#features" label={lang === "en" ? "Features" : "विशेषताएं"} iconKey="features" textColor={textColor} />
            <RotatingNavItem href="/#about" label={lang === "en" ? "About" : "हमारे बारे में"} iconKey="about" textColor={textColor} />

            <div style={{ width: 1, height: 18, background: dividerColor, margin: "0 6px" }} />

            <button
              className="nav-lang-btn"
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              aria-label="Switch language"
            >
              {lang === "en" ? "हिन्दी" : "English"}
            </button>

            {/* ── Theme toggle ── */}
            <motion.button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              animate={{ rotate: isDark ? 0 : 180 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </motion.button>

            <CTAButton
              label={lang === "en" ? "Get Started" : "शुरू करें"}
              onClick={handleGetStarted}
            />
          </div>

          {/* Hamburger */}
          <button
            className={`md:hidden ${menuOpen ? "menu-open" : ""}`}
            onClick={() => setMenuOpen(o => !o)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
            aria-label="Toggle menu"
          >
            <span className="bar bar-top" />
            <span className="bar bar-mid" />
            <span className="bar bar-bot" />
          </button>
        </div>

        {/* ── Mobile ── */}
        <div
          className={`mobile-menu md:hidden ${menuOpen ? "open" : ""}`}
          style={{
            background: mobileBg,
            borderTop: `1px solid ${mobileBorder}`,
            transition: "background 0.4s ease",
          }}
        >
          <div style={{ padding: "20px clamp(20px,5vw,40px) 28px", display: "flex", flexDirection: "column", gap: 20 }}>
            <Link 
              to="/#features" 
              className="mobile-nav-link" 
              onClick={(e) => {
                const el = document.getElementById('features');
                if (el) { e.preventDefault(); el.scrollIntoView({behavior: 'smooth'}); window.history.pushState(null, '', '/#features'); }
                setMenuOpen(false);
              }}
            >
              {lang === "en" ? "Features" : "विशेषताएं"}
            </Link>
            <Link 
              to="/#about" 
              className="mobile-nav-link" 
              onClick={(e) => {
                const el = document.getElementById('about');
                if (el) { e.preventDefault(); el.scrollIntoView({behavior: 'smooth'}); window.history.pushState(null, '', '/#about'); }
                setMenuOpen(false);
              }}
            >
              {lang === "en" ? "About" : "हमारे बारे में"}
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                className="nav-lang-btn"
                onClick={() => setLang(lang === "en" ? "hi" : "en")}
              >
                {lang === "en" ? "हिन्दी" : "English"}
              </button>

              {/* Theme toggle in mobile menu */}
              <button
                className="theme-toggle-btn"
                onClick={toggleTheme}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                style={{
                  transform: isDark ? "rotate(0deg)" : "rotate(180deg)",
                  transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>

            <CTAButton
              label={lang === "en" ? "Get Started" : "शुरू करें"}
              onClick={() => { setMenuOpen(false); handleGetStarted(); }}
              style={{ width: "100%", marginTop: 4 }}
            />
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;