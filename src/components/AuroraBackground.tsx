import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

// Generate twinkling stars
const generateStars = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
    opacity: Math.random() * 0.5 + 0.2,
  }));
};

export default function AuroraBackground() {
  const reduceMotion = useReducedMotion();
  const animated = !reduceMotion;
  
  const stars = useMemo(() => generateStars(80), []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Deep space base */}
      <div className="absolute inset-0 bg-[#030014]" />
      
      {/* Aurora layers */}
      <div className="absolute inset-0">
        {/* Primary aurora wave - Green/Cyan */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 120% 80% at 50% 120%, 
                hsl(160, 80%, 25% / 0.4) 0%,
                hsl(180, 70%, 20% / 0.3) 25%,
                hsl(200, 60%, 15% / 0.2) 50%,
                transparent 70%
              )
            `,
            filter: "blur(40px)",
          }}
          animate={animated ? {
            opacity: [0.6, 0.9, 0.6],
            scale: [1, 1.05, 1],
            y: [0, -20, 0],
          } : { opacity: 0.7 }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Secondary aurora wave - Purple/Pink */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 100% 70% at 30% 110%, 
                hsl(280, 70%, 30% / 0.35) 0%,
                hsl(300, 60%, 25% / 0.25) 30%,
                hsl(320, 50%, 20% / 0.15) 55%,
                transparent 75%
              )
            `,
            filter: "blur(50px)",
          }}
          animate={animated ? {
            opacity: [0.5, 0.8, 0.5],
            x: [-30, 30, -30],
            scale: [1, 1.1, 1],
          } : { opacity: 0.6 }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        {/* Tertiary aurora wave - Blue/Teal */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 90% 60% at 70% 115%, 
                hsl(200, 80%, 30% / 0.3) 0%,
                hsl(220, 70%, 25% / 0.2) 35%,
                hsl(240, 60%, 20% / 0.1) 60%,
                transparent 80%
              )
            `,
            filter: "blur(45px)",
          }}
          animate={animated ? {
            opacity: [0.4, 0.7, 0.4],
            x: [20, -40, 20],
            y: [0, -30, 0],
          } : { opacity: 0.5 }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        {/* Aurora curtain effect - vertical streaks */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              repeating-linear-gradient(
                90deg,
                transparent 0%,
                hsl(170, 70%, 40% / 0.08) 2%,
                transparent 4%,
                hsl(200, 60%, 35% / 0.06) 6%,
                transparent 8%
              )
            `,
            filter: "blur(2px)",
            maskImage: "linear-gradient(to top, transparent 0%, black 30%, black 70%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 0%, black 30%, black 70%, transparent 100%)",
          }}
          animate={animated ? {
            opacity: [0.3, 0.6, 0.3],
            x: [-50, 50, -50],
          } : { opacity: 0.4 }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Accent glow - warm highlight */}
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px]"
          style={{
            background: `
              radial-gradient(ellipse at center,
                hsl(45, 80%, 50% / 0.15) 0%,
                hsl(30, 70%, 40% / 0.08) 40%,
                transparent 70%
              )
            `,
            filter: "blur(60px)",
          }}
          animate={animated ? {
            opacity: [0.3, 0.5, 0.3],
            scale: [0.9, 1.1, 0.9],
          } : { opacity: 0.4 }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />
      </div>

      {/* Distant Stars */}
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
              background: `radial-gradient(circle, hsl(45, 80%, 95% / ${star.opacity}), transparent 70%)`,
              boxShadow: `0 0 ${star.size * 2}px hsl(45, 70%, 85% / ${star.opacity * 0.5})`,
            }}
            animate={animated ? {
              opacity: [star.opacity * 0.5, star.opacity, star.opacity * 0.5],
              scale: [0.9, 1.1, 0.9],
            } : { opacity: star.opacity }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${15 + i * 15}%`,
            bottom: `${20 + (i % 3) * 15}%`,
            width: 3 + (i % 3),
            height: 3 + (i % 3),
            background: `radial-gradient(circle, hsl(${160 + i * 20}, 70%, 60% / 0.6), transparent)`,
            boxShadow: `0 0 10px hsl(${160 + i * 20}, 60%, 50% / 0.4)`,
          }}
          animate={animated ? {
            y: [-20, -80, -20],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5],
          } : { opacity: 0 }}
          transition={{
            duration: 8 + i * 2,
            delay: i * 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          mixBlendMode: "overlay",
        }}
      />

      {/* Vignette effect */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, hsl(260, 50%, 5% / 0.4) 100%)`,
        }}
      />
    </div>
  );
}
