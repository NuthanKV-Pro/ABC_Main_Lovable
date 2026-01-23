import { motion, useReducedMotion } from "framer-motion";
import type { BackgroundMode } from "./BackgroundModeSwitch";

interface FuturisticBackgroundProps {
  mode?: BackgroundMode;
}

/**
 * Minimal, futuristic ambient background.
 * - No pointer events
 * - Respects prefers-reduced-motion
 * - Uses design tokens via CSS variables (HSL)
 * - Supports Grid / Solar / Off modes
 */
export default function FuturisticBackground({ mode = "solar" }: FuturisticBackgroundProps) {
  const reduceMotion = useReducedMotion();

  // SVG noise (data URI) used as a subtle grain overlay.
  // Monochrome + blend mode means it adapts to theme tokens underneath.
  const noiseSvg =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E";

  const Orbits = ({ animated }: { animated: boolean }) => {
    const stroke = "hsl(var(--primary) / 0.30)";
    const strokeSoft = "hsl(var(--primary-glow) / 0.22)";

    const orbitBase =
      "absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2";

    const orbitLineStyle: React.CSSProperties = {
      stroke,
      strokeWidth: 1,
      fill: "none",
      vectorEffect: "non-scaling-stroke",
    };

    const planetStyle: React.CSSProperties = {
      background:
        "radial-gradient(circle at 35% 35%, hsl(var(--primary-glow) / 0.55), hsl(var(--primary) / 0.18) 55%, transparent 70%)",
      boxShadow: "0 0 18px hsl(var(--primary) / 0.10)",
    };

    const ringMask: React.CSSProperties = {
      maskImage:
        "radial-gradient(520px 320px at 50% 45%, black 60%, transparent 80%)",
      WebkitMaskImage:
        "radial-gradient(520px 320px at 50% 45%, black 60%, transparent 80%)",
    };

    const MotionWrap = animated ? motion.div : "div";

    return (
      <div className="absolute inset-0" style={ringMask}>
        {/* Orbit rings (subtle gold lines) */}
        <div className={orbitBase}>
          <svg
            width="920"
            height="520"
            viewBox="0 0 920 520"
            className="opacity-[0.28]"
          >
            <defs>
              <linearGradient id="orbitGlow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="hsl(var(--primary) / 0.10)" />
                <stop offset="0.5" stopColor="hsl(var(--primary) / 0.42)" />
                <stop offset="1" stopColor="hsl(var(--primary-glow) / 0.16)" />
              </linearGradient>
            </defs>

            <ellipse cx="460" cy="260" rx="128" ry="64" style={orbitLineStyle} />
            <ellipse cx="460" cy="260" rx="220" ry="112" style={orbitLineStyle} />
            <ellipse cx="460" cy="260" rx="320" ry="168" style={orbitLineStyle} />
            <ellipse cx="460" cy="260" rx="420" ry="226" style={orbitLineStyle} />

            {/* A faint technical arc highlight */}
            <path
              d="M 88 288 C 190 140, 330 92, 460 104 C 600 118, 730 206, 826 336"
              stroke="url(#orbitGlow)"
              strokeWidth="1"
              fill="none"
              opacity="0.55"
            />
          </svg>
        </div>

        {/* Central star glow (very soft) */}
        <div
          className="absolute left-1/2 top-[38%] h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full blur-sm opacity-[0.55]"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--primary-glow) / 0.55), transparent 70%)",
          }}
        />

        {/* Revolving planets: rotate wrappers with a dot positioned on ring radius */}
        <MotionWrap
          className="absolute left-1/2 top-[38%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2"
          {...(animated
            ? {
                animate: { rotate: 360 },
                transition: {
                  duration: 52,
                  repeat: Infinity,
                  ease: "linear",
                },
              }
            : {})}
        >
          <div
            className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={planetStyle}
          />
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ transform: "translate(-50%, -50%) translateX(210px)" }}
          >
            <div className="h-2.5 w-2.5 rounded-full" style={planetStyle} />
          </div>
        </MotionWrap>

        <MotionWrap
          className="absolute left-1/2 top-[38%] h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2"
          style={{ opacity: 0.85 }}
          {...(animated
            ? {
                animate: { rotate: -360 },
                transition: {
                  duration: 78,
                  repeat: Infinity,
                  ease: "linear",
                },
              }
            : {})}
        >
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ transform: "translate(-50%, -50%) translateX(320px)" }}
          >
            <div className="h-2 w-2 rounded-full" style={planetStyle} />
          </div>
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ transform: "translate(-50%, -50%) translateX(-300px)" }}
          >
            <div className="h-1.5 w-1.5 rounded-full" style={planetStyle} />
          </div>
        </MotionWrap>

        {/* Very subtle connecting lines (technical feel) */}
        <div className={orbitBase}>
          <svg
            width="920"
            height="520"
            viewBox="0 0 920 520"
            className="opacity-[0.14]"
          >
            <line x1="460" y1="260" x2="640" y2="170" stroke={strokeSoft} />
            <line x1="460" y1="260" x2="250" y2="330" stroke={strokeSoft} />
            <line x1="460" y1="260" x2="700" y2="300" stroke={strokeSoft} />
          </svg>
        </div>
      </div>
    );
  };

  // Grid pattern component
  const GridPattern = ({ animated }: { animated: boolean }) => {
    const gridStroke = "hsl(var(--primary) / 0.12)";
    
    return (
      <div className="absolute inset-0">
        {/* Technical grid */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `
              linear-gradient(${gridStroke} 1px, transparent 1px),
              linear-gradient(90deg, ${gridStroke} 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 70%)",
          }}
        />
        
        {/* Floating grid dots at intersections */}
        {animated && (
          <motion.div
            className="absolute inset-0 opacity-[0.25]"
            style={{
              backgroundImage: `radial-gradient(circle 2px at center, hsl(var(--primary) / 0.4) 0%, transparent 100%)`,
              backgroundSize: "64px 64px",
              maskImage: "radial-gradient(ellipse 60% 50% at 50% 35%, black 10%, transparent 60%)",
              WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 35%, black 10%, transparent 60%)",
            }}
            animate={{ opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Horizontal scan lines */}
        {animated && (
          <motion.div
            className="absolute left-0 right-0 h-px opacity-[0.18]"
            style={{
              background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.5), transparent)",
            }}
            animate={{ y: [100, 400, 100] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>
    );
  };

  // If mode is off, just show the dark background
  if (mode === "off") {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
      </div>
    );
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Black/dark base */}
      <div className="absolute inset-0 bg-background" />

      {/* Soft gold ambience to keep depth without distraction */}
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          background:
            "radial-gradient(1000px 520px at 50% 12%, hsl(var(--primary) / 0.08), transparent 62%), radial-gradient(900px 520px at 20% 20%, hsl(var(--primary-glow) / 0.06), transparent 60%), radial-gradient(1000px 520px at 80% 30%, hsl(var(--primary) / 0.05), transparent 62%)",
        }}
      />

      {/* Conditional animation based on mode */}
      {mode === "solar" && <Orbits animated={!reduceMotion} />}
      {mode === "grid" && <GridPattern animated={!reduceMotion} />}

      {/* Subtle grain/noise overlay (static, non-distracting) */}
      <div
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage: `url(${noiseSvg})`,
          backgroundRepeat: "repeat",
          mixBlendMode: "soft-light",
        }}
      />

      {/* Ultra-faint scanline for technical feel (disabled in reduced motion, solar mode only) */}
      {!reduceMotion && mode === "solar" && (
        <motion.div
          className="absolute left-0 right-0 h-px opacity-[0.14]"
          style={{
            background:
              "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.45), transparent)",
          }}
          animate={{ y: [140, 560, 140] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}
