import { motion, useReducedMotion } from "framer-motion";

/**
 * Minimal, futuristic ambient background.
 * - No pointer events
 * - Respects prefers-reduced-motion
 * - Uses design tokens via CSS variables (HSL)
 */
export default function FuturisticBackground() {
  const reduceMotion = useReducedMotion();

  // SVG noise (data URI) used as a subtle grain overlay.
  // Monochrome + blend mode means it adapts to theme tokens underneath.
  const noiseSvg =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E";

  if (reduceMotion) {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {/* Dark, minimal base */}
        <div className="absolute inset-0 bg-background" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1100px 520px at 50% 0%, hsl(var(--primary) / 0.10), transparent 60%), radial-gradient(900px 520px at 50% 100%, hsl(var(--primary) / 0.06), transparent 60%)",
          }}
        />

        {/* Subtle grain (static; respects reduced motion by staying non-animated) */}
        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage: `url(${noiseSvg})`,
            backgroundRepeat: "repeat",
            mixBlendMode: "soft-light",
          }}
        />
      </div>
    );
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Dark base */}
      <div className="absolute inset-0 bg-background" />

      {/* Gold ambience (very soft) */}
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          background:
            "radial-gradient(1100px 520px at 50% 0%, hsl(var(--primary) / 0.10), transparent 62%), radial-gradient(900px 520px at 20% 25%, hsl(var(--primary-glow) / 0.08), transparent 60%), radial-gradient(900px 520px at 85% 35%, hsl(var(--primary) / 0.07), transparent 62%)",
        }}
      />

      {/* Subtle animated orbs */}
      <motion.div
        className="absolute -top-44 -left-48 h-[560px] w-[560px] rounded-full blur-3xl"
        style={{ background: "hsl(var(--primary) / 0.09)" }}
        animate={{ x: [0, 40, 0], y: [0, 24, 0], scale: [1, 1.03, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -top-56 right-[-12rem] h-[560px] w-[560px] rounded-full blur-3xl"
        style={{ background: "hsl(var(--primary-glow) / 0.07)" }}
        animate={{ x: [0, -36, 0], y: [0, 28, 0], scale: [1, 1.03, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Grid overlay (faint) */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--primary) / 0.22) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary) / 0.22) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(700px 420px at 50% 30%, black 55%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(700px 420px at 50% 30%, black 55%, transparent 75%)",
        }}
      />

      {/* Subtle grain/noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage: `url(${noiseSvg})`,
          backgroundRepeat: "repeat",
          mixBlendMode: "soft-light",
        }}
      />

      {/* Moving scanline */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] opacity-[0.22]"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.45), transparent)",
        }}
        animate={{ y: [140, 560, 140] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
