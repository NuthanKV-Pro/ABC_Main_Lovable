import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

// Planet data with orbital parameters - 8 planets (no Pluto)
const planets = [
  { name: "Mercury", radius: 45, size: 4, duration: 12, color: "hsl(35, 30%, 55%)" },
  { name: "Venus", radius: 70, size: 6, duration: 18, color: "hsl(40, 50%, 65%)" },
  { name: "Earth", radius: 100, size: 7, duration: 25, color: "hsl(200, 60%, 50%)", hasMoon: true },
  { name: "Mars", radius: 130, size: 5, duration: 35, color: "hsl(15, 60%, 45%)" },
  { name: "Jupiter", radius: 180, size: 16, duration: 50, color: "hsl(30, 45%, 55%)" },
  { name: "Saturn", radius: 230, size: 14, duration: 70, color: "hsl(45, 40%, 60%)", hasRings: true },
  { name: "Uranus", radius: 280, size: 10, duration: 95, color: "hsl(180, 40%, 55%)" },
  { name: "Neptune", radius: 330, size: 9, duration: 120, color: "hsl(220, 50%, 50%)" },
];

// Generate distant stars
const generateStars = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
    opacity: Math.random() * 0.6 + 0.3,
  }));
};

// Generate shooting stars/comets
const generateShootingStars = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: Math.random() * 30 + 70, // Start from right side
    startY: Math.random() * 40,
    delay: Math.random() * 15 + i * 8, // Stagger appearances
    duration: Math.random() * 1.5 + 1,
    length: Math.random() * 80 + 40,
    angle: Math.random() * 20 + 200, // Angle in degrees (moving left-down)
  }));
};

// Hook to get responsive scale
const useResponsiveScale = () => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const minDimension = Math.min(width, height);
      
      if (minDimension < 400) {
        setScale(0.35);
      } else if (minDimension < 600) {
        setScale(0.45);
      } else if (minDimension < 768) {
        setScale(0.55);
      } else if (minDimension < 1024) {
        setScale(0.65);
      } else if (minDimension < 1400) {
        setScale(0.8);
      } else {
        setScale(0.95);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return scale;
};

export default function SolarSystemBackground() {
  const reduceMotion = useReducedMotion();
  const scale = useResponsiveScale();
  
  // Memoize generated elements
  const stars = useMemo(() => generateStars(60), []);
  const shootingStars = useMemo(() => generateShootingStars(5), []);

  const animated = !reduceMotion;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Deep space background */}
      <div className="absolute inset-0 bg-[#030308]" />
      
      {/* Subtle nebula gradients */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 80%, hsl(260, 50%, 15% / 0.5), transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 20%, hsl(200, 40%, 12% / 0.4), transparent 45%)
          `,
        }}
      />

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
              opacity: [star.opacity * 0.6, star.opacity, star.opacity * 0.6],
              scale: [0.95, 1.05, 0.95],
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

      {/* Shooting Stars / Comets */}
      {shootingStars.map((comet) => (
        <motion.div
          key={`comet-${comet.id}`}
          className="absolute"
          style={{
            left: `${comet.startX}%`,
            top: `${comet.startY}%`,
            width: comet.length,
            height: 2,
            background: `linear-gradient(90deg, transparent, hsl(45, 100%, 90% / 0.8), hsl(45, 100%, 95%))`,
            borderRadius: 2,
            transform: `rotate(${comet.angle}deg)`,
            transformOrigin: "right center",
            boxShadow: `0 0 8px hsl(45, 100%, 85% / 0.6), 0 0 20px hsl(45, 100%, 80% / 0.3)`,
          }}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={animated ? {
            opacity: [0, 1, 1, 0],
            x: [-comet.length * 2, -comet.length * 4],
            y: [0, comet.length * 1.5],
          } : { opacity: 0 }}
          transition={{
            duration: comet.duration,
            delay: comet.delay,
            repeat: Infinity,
            repeatDelay: 12 + Math.random() * 10,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Solar System Container - centered with tilt and responsive scaling */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ 
          transform: `scale(${scale}) perspective(800px) rotateX(65deg)`,
          transformOrigin: 'center center',
        }}
      >
        {/* Sun */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 30,
            height: 30,
            background: "radial-gradient(circle at 35% 35%, hsl(50, 100%, 80%), hsl(40, 100%, 60%) 50%, hsl(30, 100%, 50%) 100%)",
            boxShadow: `
              0 0 40px hsl(45, 100%, 65% / 0.9),
              0 0 80px hsl(40, 100%, 55% / 0.6),
              0 0 120px hsl(35, 100%, 50% / 0.4)
            `,
          }}
          animate={animated ? {
            boxShadow: [
              "0 0 40px hsl(45, 100%, 65% / 0.9), 0 0 80px hsl(40, 100%, 55% / 0.6), 0 0 120px hsl(35, 100%, 50% / 0.4)",
              "0 0 50px hsl(45, 100%, 70% / 1), 0 0 100px hsl(40, 100%, 60% / 0.7), 0 0 150px hsl(35, 100%, 55% / 0.5)",
              "0 0 40px hsl(45, 100%, 65% / 0.9), 0 0 80px hsl(40, 100%, 55% / 0.6), 0 0 120px hsl(35, 100%, 50% / 0.4)",
            ],
          } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Orbit lines */}
        <svg
          className="absolute"
          width="800"
          height="800"
          viewBox="-400 -400 800 800"
          style={{ opacity: 0.25 }}
        >
          {planets.map((planet) => (
            <ellipse
              key={planet.name}
              cx="0"
              cy="0"
              rx={planet.radius}
              ry={planet.radius}
              fill="none"
              stroke="hsl(220, 30%, 50% / 0.5)"
              strokeWidth="0.5"
              strokeDasharray="4 4"
            />
          ))}
        </svg>

        {/* Planets */}
        {planets.map((planet) => (
          <motion.div
            key={planet.name}
            className="absolute"
            style={{ width: 0, height: 0 }}
            animate={animated ? { rotate: 360 } : {}}
            transition={{ duration: planet.duration, repeat: Infinity, ease: "linear" }}
          >
            {/* Planet container at orbital distance */}
            <div
              className="absolute"
              style={{
                left: planet.radius,
                top: -planet.size / 2,
              }}
            >
              {/* Planet body */}
              <div
                className="rounded-full relative"
                style={{
                  width: planet.size,
                  height: planet.size,
                  background: `radial-gradient(circle at 30% 30%, ${planet.color}, ${planet.color.replace(')', ' / 0.6)')})`,
                  boxShadow: `0 0 ${planet.size}px ${planet.color.replace(')', ' / 0.6)')}`,
                }}
              >
                {/* Saturn's rings */}
                {planet.hasRings && (
                  <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      width: planet.size * 2.4,
                      height: planet.size * 0.6,
                      border: `2px solid hsl(45, 50%, 65% / 0.7)`,
                      borderRadius: "50%",
                      transform: "translate(-50%, -50%) rotateX(75deg)",
                    }}
                  />
                )}
              </div>

              {/* Earth's Moon */}
              {planet.hasMoon && (
                <motion.div
                  className="absolute"
                  style={{
                    left: planet.size / 2,
                    top: planet.size / 2,
                    width: 0,
                    height: 0,
                  }}
                  animate={animated ? { rotate: -720 } : {}}
                  transition={{ duration: planet.duration / 4, repeat: Infinity, ease: "linear" }}
                >
                  <div
                    className="absolute rounded-full"
                    style={{
                      left: planet.size * 1.2,
                      top: 0,
                      width: 3,
                      height: 3,
                      background: "hsl(0, 0%, 80%)",
                      boxShadow: "0 0 6px hsl(0, 0%, 90% / 0.6)",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Subtle grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}
