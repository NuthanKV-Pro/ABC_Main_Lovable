import { motion, useReducedMotion } from "framer-motion";

/**
 * Minimal, futuristic ambient background.
 * - No pointer events
 * - Respects prefers-reduced-motion
 * - Uses design tokens via CSS variables (HSL)
 */
export default function FuturisticBackground() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-background" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            background:
              "radial-gradient(900px 420px at 20% 10%, hsl(var(--primary) / 0.10), transparent 60%), radial-gradient(700px 360px at 85% 25%, hsl(var(--accent) / 0.10), transparent 60%)",
          }}
        />
      </div>
    );
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Base wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-background" />

      {/* Subtle animated orbs */}
      <motion.div
        className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{ background: "hsl(var(--primary) / 0.12)" }}
        animate={{ x: [0, 70, 0], y: [0, 40, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -top-52 right-[-10rem] h-[520px] w-[520px] rounded-full blur-3xl"
        style={{ background: "hsl(var(--accent) / 0.10)" }}
        animate={{ x: [0, -60, 0], y: [0, 55, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Grid overlay (faint) */}
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--border) / 0.9) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border) / 0.9) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(700px 420px at 50% 30%, black 55%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(700px 420px at 50% 30%, black 55%, transparent 75%)",
        }}
      />

      {/* Moving scanline */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] opacity-[0.35]"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.55), transparent)",
        }}
        animate={{ y: [140, 560, 140] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
