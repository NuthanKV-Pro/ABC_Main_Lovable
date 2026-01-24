import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import type { BackgroundMode } from "./BackgroundModeSwitch";

// Generate random stars for the starfield
const generateStars = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
    opacity: Math.random() * 0.5 + 0.3,
  }));
};

interface FuturisticBackgroundProps {
  mode?: BackgroundMode;
}

/**
 * Minimal, futuristic ambient background with mouse parallax.
 * - No pointer events
 * - Respects prefers-reduced-motion
 * - Uses design tokens via CSS variables (HSL)
 * - Supports Grid / Solar / Off modes
 */
export default function FuturisticBackground({ mode = "solar" }: FuturisticBackgroundProps) {
  const reduceMotion = useReducedMotion();
  
  // Mouse parallax state
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring values for parallax
  const springConfig = { damping: 25, stiffness: 100 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);
  
  // Transform for different parallax layers
  const parallaxX1 = useTransform(springX, [-0.5, 0.5], [-15, 15]);
  const parallaxY1 = useTransform(springY, [-0.5, 0.5], [-10, 10]);
  const parallaxX2 = useTransform(springX, [-0.5, 0.5], [-25, 25]);
  const parallaxY2 = useTransform(springY, [-0.5, 0.5], [-18, 18]);
  const parallaxRotate = useTransform(springX, [-0.5, 0.5], [-3, 3]);

  useEffect(() => {
    if (reduceMotion || mode === "off") return;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position to -0.5 to 0.5
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [reduceMotion, mode, mouseX, mouseY]);

  // SVG noise (data URI) used as a subtle grain overlay.
  const noiseSvg =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E";

  // Memoize stars so they don't regenerate on every render
  const stars = useMemo(() => generateStars(60), []);

  // Starfield component for Solar mode
  const Starfield = ({ animated }: { animated: boolean }) => {
    return (
      <div className="absolute inset-0">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              background: `radial-gradient(circle, hsl(var(--primary-glow) / ${star.opacity}), hsl(var(--primary) / ${star.opacity * 0.5}))`,
              boxShadow: `0 0 ${star.size * 2}px hsl(var(--primary-glow) / ${star.opacity * 0.5})`,
            }}
            animate={animated && !reduceMotion ? {
              opacity: [star.opacity * 0.4, star.opacity, star.opacity * 0.4],
              scale: [0.8, 1.2, 0.8],
            } : { opacity: star.opacity * 0.7 }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  };

  const Orbits = ({ animated }: { animated: boolean }) => {
    const stroke = "hsl(var(--primary) / 0.45)";
    const strokeSoft = "hsl(var(--primary-glow) / 0.35)";

    const orbitBase =
      "absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2";

    const orbitLineStyle: React.CSSProperties = {
      stroke,
      strokeWidth: 1.5,
      fill: "none",
      vectorEffect: "non-scaling-stroke",
    };

    const planetStyle: React.CSSProperties = {
      background:
        "radial-gradient(circle at 35% 35%, hsl(var(--primary-glow) / 0.75), hsl(var(--primary) / 0.35) 55%, transparent 70%)",
      boxShadow: "0 0 24px hsl(var(--primary) / 0.25), 0 0 48px hsl(var(--primary-glow) / 0.15)",
    };

    const ringMask: React.CSSProperties = {
      maskImage:
        "radial-gradient(600px 380px at 50% 45%, black 50%, transparent 75%)",
      WebkitMaskImage:
        "radial-gradient(600px 380px at 50% 45%, black 50%, transparent 75%)",
    };

    const MotionWrap = animated ? motion.div : "div";

    return (
      <motion.div 
        className="absolute inset-0" 
        style={{ 
          ...(animated && !reduceMotion ? { x: parallaxX1, y: parallaxY1 } : {}),
          ...ringMask 
        }}
      >
        {/* Orbit rings (gold lines - more visible) */}
        <motion.div 
          className={orbitBase}
          style={animated && !reduceMotion ? { rotate: parallaxRotate } : {}}
        >
          <svg
            width="920"
            height="520"
            viewBox="0 0 920 520"
            className="opacity-[0.5]"
          >
            <defs>
              <linearGradient id="orbitGlow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="hsl(var(--primary) / 0.15)" />
                <stop offset="0.5" stopColor="hsl(var(--primary) / 0.6)" />
                <stop offset="1" stopColor="hsl(var(--primary-glow) / 0.25)" />
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
              strokeWidth="2"
              fill="none"
              opacity="0.7"
            />
          </svg>
        </motion.div>

        {/* Central star glow (brighter) with pulsing effect synced to planets */}
        <motion.div
          className="absolute left-1/2 top-[38%] h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full blur-md"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--primary-glow) / 0.8), hsl(var(--primary) / 0.4) 50%, transparent 70%)",
          }}
          animate={animated && !reduceMotion ? {
            opacity: [0.6, 0.85, 0.6],
            scale: [1, 1.15, 1],
          } : { opacity: 0.7 }}
          transition={{
            duration: 4.5, // Synced with inner planet's 45s rotation (1/10th)
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Secondary outer glow pulse for depth */}
        <motion.div
          className="absolute left-1/2 top-[38%] h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--primary) / 0.3), transparent 65%)",
          }}
          animate={animated && !reduceMotion ? {
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.2, 1],
          } : { opacity: 0.35 }}
          transition={{
            duration: 6.5, // Synced with outer planet's 65s rotation (1/10th)
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Revolving planets: rotate wrappers with a dot positioned on ring radius */}
        <MotionWrap
          className="absolute left-1/2 top-[38%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2"
          {...(animated
            ? {
                animate: { rotate: 360 },
                transition: {
                  duration: 45,
                  repeat: Infinity,
                  ease: "linear",
                },
              }
            : {})}
        >
          <div
            className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={planetStyle}
          />
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ transform: "translate(-50%, -50%) translateX(210px)" }}
          >
            <div className="h-3.5 w-3.5 rounded-full" style={planetStyle} />
          </div>
        </MotionWrap>

        <MotionWrap
          className="absolute left-1/2 top-[38%] h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2"
          style={{ opacity: 0.9 }}
          {...(animated
            ? {
                animate: { rotate: -360 },
                transition: {
                  duration: 65,
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
            <div className="h-3 w-3 rounded-full" style={planetStyle} />
          </div>
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ transform: "translate(-50%, -50%) translateX(-300px)" }}
          >
            <div className="h-2.5 w-2.5 rounded-full" style={planetStyle} />
          </div>
        </MotionWrap>

        {/* Very subtle connecting lines (technical feel) */}
        <div className={orbitBase}>
          <svg
            width="920"
            height="520"
            viewBox="0 0 920 520"
            className="opacity-[0.25]"
          >
            <line x1="460" y1="260" x2="640" y2="170" stroke={strokeSoft} strokeWidth="1" />
            <line x1="460" y1="260" x2="250" y2="330" stroke={strokeSoft} strokeWidth="1" />
            <line x1="460" y1="260" x2="700" y2="300" stroke={strokeSoft} strokeWidth="1" />
          </svg>
        </div>
      </motion.div>
    );
  };

  // Grid pattern component
  const GridPattern = ({ animated }: { animated: boolean }) => {
    const gridStroke = "hsl(var(--primary) / 0.20)";
    
    return (
      <motion.div 
        className="absolute inset-0"
        style={animated && !reduceMotion ? { x: parallaxX2, y: parallaxY2 } : {}}
      >
        {/* Technical grid */}
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage: `
              linear-gradient(${gridStroke} 1px, transparent 1px),
              linear-gradient(90deg, ${gridStroke} 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 85% 65% at 50% 30%, black 25%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 85% 65% at 50% 30%, black 25%, transparent 75%)",
          }}
        />
        
        {/* Floating grid dots at intersections */}
        {animated && (
          <motion.div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage: `radial-gradient(circle 3px at center, hsl(var(--primary) / 0.6) 0%, transparent 100%)`,
              backgroundSize: "64px 64px",
              maskImage: "radial-gradient(ellipse 70% 55% at 50% 35%, black 15%, transparent 65%)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 55% at 50% 35%, black 15%, transparent 65%)",
            }}
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Horizontal scan lines */}
        {animated && (
          <>
            <motion.div
              className="absolute left-0 right-0 h-px opacity-[0.35]"
              style={{
                background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.7), transparent)",
              }}
              animate={{ y: [80, 450, 80] }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute left-0 right-0 h-px opacity-[0.2]"
              style={{
                background: "linear-gradient(90deg, transparent, hsl(var(--primary-glow) / 0.5), transparent)",
              }}
              animate={{ y: [300, 100, 300] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
          </>
        )}
      </motion.div>
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

      {/* Soft gold ambience - more visible */}
      <div
        className="absolute inset-0 opacity-[0.7]"
        style={{
          background:
            "radial-gradient(1000px 520px at 50% 12%, hsl(var(--primary) / 0.12), transparent 62%), radial-gradient(900px 520px at 20% 20%, hsl(var(--primary-glow) / 0.10), transparent 60%), radial-gradient(1000px 520px at 80% 30%, hsl(var(--primary) / 0.08), transparent 62%)",
        }}
      />

      {/* Starfield layer (behind orbits in solar mode) */}
      {mode === "solar" && <Starfield animated={!reduceMotion} />}

      {/* Conditional animation based on mode */}
      {mode === "solar" && <Orbits animated={!reduceMotion} />}
      {mode === "grid" && <GridPattern animated={!reduceMotion} />}

      {/* Subtle grain/noise overlay (static, non-distracting) */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `url(${noiseSvg})`,
          backgroundRepeat: "repeat",
          mixBlendMode: "soft-light",
        }}
      />

      {/* Ultra-faint scanline for technical feel (disabled in reduced motion, solar mode only) */}
      {!reduceMotion && mode === "solar" && (
        <motion.div
          className="absolute left-0 right-0 h-px opacity-[0.25]"
          style={{
            background:
              "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.6), transparent)",
          }}
          animate={{ y: [120, 500, 120] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}