import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";
import { useClerk, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// RotatingNavItem — exact replica of the Framer component's NavItem behaviour:
//   • Resting state  → text label visible, icon hidden below
//   • Hover state    → text slides UP and out, icon slides UP and in from below
//   • Circular SVG text path spins continuously while hovered
//     (this is the "rotating text" the Framer component is named for)
// ─────────────────────────────────────────────────────────────────────────────

interface RotatingNavItemProps {
  href: string;
  label: string;
  iconKey: string;
  onClick?: () => void;
}

// Icons matching the Framer component's four nav items (House, Briefcase, Info, Envelope)
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

// Spring matching the Framer source: bounce 0.2, duration 0.4
const spring = { type: "spring" as const, bounce: 0.2, duration: 0.4 };

const RotatingNavItem: React.FC<RotatingNavItemProps> = ({ href, label, iconKey, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const isExternal = href.startsWith('http');
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
      {/* ── Circular rotating text (spins on hover) ── */}
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

      {/* ── Text label: visible at rest, slides up & out on hover ── */}
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
          color: "#f5f5f7",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </motion.span>

      {/* ── Icon: hidden at rest, slides up from below on hover ── */}
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

  if (isScroll) {
    return <a href={href} onClick={onClick}>{content}</a>;
  }
  return <Link to={href} onClick={onClick}>{content}</Link>;
};

// ─────────────────────────────────────────────────────────────────────────────
// CTAButton — same spring slide-up swap on the pill button
// ─────────────────────────────────────────────────────────────────────────────
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
      animate={hovered ? { y: -1, boxShadow: "0 8px 25px rgba(255,122,61,0.4)" } : { y: 0, boxShadow: "0 4px 15px rgba(255,122,61,0.2)" }}
      transition={{ duration: 0.3 }}
      style={{
        fontFamily: "'Jost', sans-serif",
        fontSize: "0.78rem",
        fontWeight: 600,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#fff",
        background: "linear-gradient(135deg, #ff7a3d 0%, #ff5e2e 100%)",
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
      {/* Outgoing text */}
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

      {/* Incoming text (from below) */}
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

      {/* Invisible spacer keeps button width stable */}
      <span style={{ visibility: "hidden", whiteSpace: "nowrap" }}>{label}</span>
    </motion.button>
  );
};

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleGetStarted = () => {
    if (isSignedIn) navigate("/start");
    else openSignIn({ redirectUrl: "/start" });
  };

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
          color: #f5f5f7;
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
          color: #f5f5f7;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .mobile-nav-link:hover { color: #ff7a3d; }
        .bar {
          display: block;
          width: 20px;
          height: 1.5px;
          background: #f5f5f7;
          transition: transform 0.35s ease, opacity 0.3s ease;
        }
        .bar-mid { margin: 5px 0; }
        .menu-open .bar-top  { transform: translateY(6.5px) rotate(45deg); }
        .menu-open .bar-mid  { opacity: 0; }
        .menu-open .bar-bot  { transform: translateY(-6.5px) rotate(-45deg); }
      `}</style>

      <nav
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 50,
          background: scrolled ? "rgba(13, 15, 26, 0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
          transition: "all 0.4s ease",
          boxShadow: scrolled ? "0 10px 40px rgba(0,0,0,0.4)" : "none",
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
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.55rem", fontWeight: 600, letterSpacing: "0.06em", color: "#f5f5f7", lineHeight: 1 }}>Sak</span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.55rem", fontWeight: 400, fontStyle: "italic", letterSpacing: "0.06em", color: "#ff7a3d", lineHeight: 1 }}>sham</span>
          </Link>

          {/* ── Desktop ── */}
          <div className="hidden md:flex" style={{ alignItems: "center", gap: "clamp(4px, 2vw, 20px)" }}>
            <RotatingNavItem href="/#features" label={lang === "en" ? "Features" : "विशेषताएं"} iconKey="features" />
            <RotatingNavItem href="/about" label={lang === "en" ? "About" : "हमारे बारे में"} iconKey="about" />

            <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.15)", margin: "0 6px" }} />

            <button className="nav-lang-btn" onClick={() => setLang(lang === "en" ? "hi" : "en")} aria-label="Switch language">
              {lang === "en" ? "हिन्दी" : "English"}
            </button>

            <CTAButton label={lang === "en" ? "Get Started" : "शुरू करें"} onClick={handleGetStarted} />
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
          style={{ background: "rgba(13,15,26,0.98)", borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div style={{ padding: "20px clamp(20px,5vw,40px) 28px", display: "flex", flexDirection: "column", gap: 20 }}>
            <Link to="/#features" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
              {lang === "en" ? "Features" : "विशेषताएं"}
            </Link>
            <Link to="/about" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
              {lang === "en" ? "About" : "हमारे बारे में"}
            </Link>
            <button className="nav-lang-btn" onClick={() => setLang(lang === "en" ? "hi" : "en")}>
              {lang === "en" ? "हिन्दी" : "English"}
            </button>
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