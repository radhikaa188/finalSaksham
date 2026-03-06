import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// TextClipPathReveal
// Exact port of https://framer.com/m/Text-Clip-Path-Reveal-LM9j.js
//
// Each line of text is hidden behind a clipPath inset, then revealed on scroll.
// Easing, stagger, duration and direction all match the Framer source exactly.
// ─────────────────────────────────────────────────────────────────────────────

type RevealDirection = "top" | "bottom" | "left" | "right" | "center";

interface TextClipPathRevealProps {
  /** Text to reveal. Use \n to split into separately-staggered lines. */
  text: string;
  /** Direction the clip reveals from. Default: "bottom" */
  revealDirection?: RevealDirection;
  /** Seconds between each line reveal. Default: 0.15 */
  staggerDelay?: number;
  /** Duration of each line's reveal animation. Default: 0.8 */
  duration?: number;
  /** Text color */
  color?: string;
  /** Background color of the container */
  backgroundColor?: string;
  /** Any CSS className */
  className?: string;
  /** Any inline style */
  style?: React.CSSProperties;
  /** Re-animate every time it enters view (false = animate once) */
  once?: boolean;
}

// Exact hidden states from Framer source
function getHiddenAnim(d: RevealDirection) {
  switch (d) {
    case "top":    return { clipPath: "inset(100% 0% 0% 0%)", y: -40 };
    case "bottom": return { clipPath: "inset(0% 0% 100% 0%)", y: 40 };
    case "left":   return { clipPath: "inset(0% 100% 0% 0%)", x: -40 };
    case "right":  return { clipPath: "inset(0% 0% 0% 100%)", x: 40 };
    case "center": return { clipPath: "inset(50% 50% 50% 50%)", scale: 0.8 };
    default:       return { clipPath: "inset(0% 0% 100% 0%)", y: 40 };
  }
}

export const TextClipPathReveal: React.FC<TextClipPathRevealProps> = ({
  text,
  revealDirection = "bottom",
  staggerDelay = 0.15,
  duration = 0.8,
  color = "#f5f5f7",
  backgroundColor = "transparent",
  className,
  style,
  once = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Exact Framer source: amount 0.3, once: false (re-animates on scroll)
  const isInView = useInView(containerRef, { amount: 0.3, once });

  const lines = text.split("\n").filter(l => l.length > 0);

  const hiddenAnim = getHiddenAnim(revealDirection);

  return (
    <motion.div
      ref={containerRef}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        visible: { transition: { staggerChildren: staggerDelay } },
        hidden:  {},
      }}
      className={className}
      style={{ color, backgroundColor, width: "100%", ...style }}
    >
      {lines.map((line, i) => (
        <motion.div
          key={i}
          variants={{
            hidden:  hiddenAnim,
            visible: {
              clipPath: "inset(0% 0% 0% 0%)",
              y: 0, x: 0, scale: 1,
              // Exact easing from Framer source
              transition: { duration, ease: [0.2, 0.65, 0.3, 0.9] },
            },
          }}
        >
          {line}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default TextClipPathReveal;