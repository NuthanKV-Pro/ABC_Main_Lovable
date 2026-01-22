import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useMemo } from "react";

type Particle = {
  id: string;
  left: string;
  top: string;
  size: number;
  opacity: number;
  blur: number;
  drift: number;
};

function createParticles(count: number): Particle[] {
  // Deterministic-enough while still feeling organic.
  const seed = 13;
  let s = seed;
  const rnd = () => {
    // Linear congruential generator
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };

  return Array.from({ length: count }).map((_, i) => {
    const r1 = rnd();
    const r2 = rnd();
    const r3 = rnd();
    const r4 = rnd();

    const size = 2 + Math.round(r1 * 6);
    const opacity = 0.08 + r2 * 0.16;
    const blur = 0.2 + r3 * 1.6;
    const drift = (r4 - 0.5) * 40;

    return {
      id: `p_${i}`,
      left: `${Math.round(r2 * 100)}%`,
      top: `${Math.round(r3 * 100)}%`,
      size,
      opacity,
      blur,
      drift,
    };
  });
}

export default function FuturisticBackground() {
  const reduceMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const { scrollYProgress } = useScroll();

  // Mouse-parallax transforms
  const gridX = useTransform(mouseX, [-0.5, 0.5], reduceMotion ? [0, 0] : [-18, 18]);
  const gridY = useTransform(mouseY, [-0.5, 0.5], reduceMotion ? [0, 0] : [-12, 12]);

  const glowX = useTransform(mouseX, [-0.5, 0.5], reduceMotion ? [0, 0] : [-40, 40]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], reduceMotion ? [0, 0] : [-30, 30]);

  // Scroll-reactive transforms
  const scanlineY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [-60, 80]);
  const fieldRotate = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [-1.5, 1.5]);

  useEffect(() => {
    if (reduceMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      mouseX.set(nx);
      mouseY.set(ny);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, reduceMotion]);

  const particles = useMemo(() => createParticles(22), []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Base: soft hero wash (uses theme tokens only) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(900px 600px at 20% 10%, hsl(var(--primary) / 0.14), transparent 60%), radial-gradient(700px 520px at 80% 30%, hsl(var(--accent) / 0.10), transparent 62%), radial-gradient(900px 700px at 50% 90%, hsl(var(--primary) / 0.08), transparent 65%)",
        }}
      />

      {/* Interactive grid */}
      <motion.div
        className="absolute inset-0 opacity-60"
        style={{
          x: gridX,
          y: gridY,
          rotate: fieldRotate,
          backgroundImage:
            "linear-gradient(to right, hsl(var(--border) / 0.20) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border) / 0.18) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 70% 55% at 50% 30%, black 55%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 55% at 50% 30%, black 55%, transparent 72%)",
        }}
      />

      {/* Neon arcs / glows */}
      <motion.div
        className="absolute -left-32 top-10 h-[520px] w-[520px] rounded-full"
        style={{
          x: glowX,
          y: glowY,
          background:
            "radial-gradient(circle at 30% 30%, hsl(var(--primary) / 0.22), transparent 55%), radial-gradient(circle at 70% 65%, hsl(var(--primary-glow) / 0.14), transparent 60%)",
          filter: "blur(2px)",
        }}
      />
      <motion.div
        className="absolute -right-40 top-52 h-[620px] w-[620px] rounded-full"
        style={{
          x: glowX,
          y: glowY,
          background:
            "radial-gradient(circle at 55% 45%, hsl(var(--accent) / 0.18), transparent 58%), radial-gradient(circle at 35% 70%, hsl(var(--primary) / 0.12), transparent 62%)",
          filter: "blur(3px)",
        }}
      />

      {/* Scanline band (scroll-reactive) */}
      <motion.div
        className="absolute left-0 right-0 top-0 h-40"
        style={{
          y: scanlineY,
          backgroundImage:
            "linear-gradient(to bottom, transparent, hsl(var(--primary) / 0.10), transparent)",
          opacity: 0.9,
        }}
      />

      {/* Particles */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              backgroundColor: "hsl(var(--primary) / 1)",
              opacity: p.opacity,
              filter: `blur(${p.blur}px)`,
            }}
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, -18, 0],
                    x: [0, p.drift, 0],
                    opacity: [p.opacity, p.opacity + 0.08, p.opacity],
                  }
            }
            transition={
              reduceMotion
                ? undefined
                : {
                    duration: 6 + (p.size % 3) * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: (p.size % 5) * 0.35,
                  }
            }
          />
        ))}
      </div>

      {/* Subtle vignette for legibility */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(1200px 700px at 50% 20%, transparent 55%, hsl(var(--background) / 0.92) 100%)",
          opacity: 0.55,
        }}
      />
    </div>
  );
}
