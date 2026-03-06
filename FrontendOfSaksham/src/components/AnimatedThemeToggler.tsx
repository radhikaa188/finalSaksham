import { useCallback, useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";

interface AnimatedThemeTogglerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  duration?: number;
}

export default function AnimatedThemeToggler({
  className = "",
  duration = 400,
  ...props
}: AnimatedThemeTogglerProps) {
  const [isDark, setIsDark] = useState<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = useCallback(() => {
    if (!buttonRef.current) return;

    const applyTheme = () => {
      const newTheme = !isDark;
      setIsDark(newTheme);
      document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", newTheme ? "dark" : "light");
    };

    // fallback if browser doesn't support view transitions
    if (!(document as any).startViewTransition) {
      applyTheme();
      return;
    }

    const transition = (document as any).startViewTransition(() => {
      flushSync(applyTheme);
    });

    transition.ready.then(() => {
      const button = buttonRef.current;
      if (!button) return;

      const { top, left, width, height } = button.getBoundingClientRect();

      const x = left + width / 2;
      const y = top + height / 2;

      const maxRadius = Math.hypot(
        Math.max(left, window.innerWidth - left),
        Math.max(top, window.innerHeight - top)
      );

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: duration,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)" as any,
        }
      );
    });
  }, [isDark, duration]);

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={className}
      {...props}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}