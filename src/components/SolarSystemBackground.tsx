import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

interface SolarSystemBackgroundProps {
  enabled?: boolean;
}

// Planet data with orbital parameters - scaled down for visibility
const planets = [
  { name: "Mercury", radius: 35, size: 3, duration: 15, color: "hsl(35, 30%, 55%)", moons: 0 },
  { name: "Venus", radius: 55, size: 5, duration: 22, color: "hsl(40, 50%, 65%)", moons: 0 },
  { name: "Earth", radius: 80, size: 6, duration: 30, color: "hsl(200, 60%, 50%)", moons: 1, moonSize: 2 },
  { name: "Mars", radius: 105, size: 4, duration: 38, color: "hsl(15, 60%, 45%)", moons: 2, moonSize: 1.5 },
  { name: "Jupiter", radius: 145, size: 12, duration: 55, color: "hsl(30, 45%, 55%)", moons: 4, moonSize: 2 },
  { name: "Saturn", radius: 185, size: 10, duration: 70, color: "hsl(45, 40%, 60%)", moons: 3, moonSize: 1.8, hasRings: true },
  { name: "Uranus", radius: 225, size: 8, duration: 90, color: "hsl(180, 40%, 55%)", moons: 2, moonSize: 1.5 },
  { name: "Neptune", radius: 260, size: 7, duration: 110, color: "hsl(220, 50%, 50%)", moons: 1, moonSize: 1.8 },
  { name: "Pluto", radius: 295, size: 2, duration: 140, color: "hsl(30, 20%, 50%)", moons: 1, moonSize: 1 },
];

// Generate distant stars
const generateStars = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5,
    delay: Math.random() * 8,
    duration: Math.random() * 4 + 3,
    opacity: Math.random() * 0.4 + 0.2,
  }));
};

// Generate asteroid belt particles
const generateAsteroids = (count: number, innerRadius: number, outerRadius: number) => {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
    const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
    return {
      id: i,
      angle,
      radius,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      duration: 80 + Math.random() * 40,
    };
  });
};

// Hook to get responsive scale
const useResponsiveScale = () => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const minDimension = Math.min(width, height);
      
      // Scale based on viewport - ensure solar system fits
      if (minDimension < 500) {
        setScale(0.4);
      } else if (minDimension < 768) {
        setScale(0.55);
      } else if (minDimension < 1024) {
        setScale(0.7);
      } else if (minDimension < 1400) {
        setScale(0.85);
      } else {
        setScale(1);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return scale;
};

export default function SolarSystemBackground({ enabled = true }: SolarSystemBackgroundProps) {
  const reduceMotion = useReducedMotion();
  const scale = useResponsiveScale();
  
  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 30, stiffness: 80 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);
  
  const parallaxX = useTransform(springX, [-0.5, 0.5], [-20, 20]);
  const parallaxY = useTransform(springY, [-0.5, 0.5], [-15, 15]);

  useEffect(() => {
    if (reduceMotion || !enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [reduceMotion, enabled, mouseX, mouseY]);

  // Memoize generated elements - scaled down asteroid belts
  const stars = useMemo(() => generateStars(35), []);
  const mainBeltAsteroids = useMemo(() => generateAsteroids(40, 120, 140), []);
  const kuiperBeltAsteroids = useMemo(() => generateAsteroids(50, 280, 320), []);

  const animated = !reduceMotion && enabled;

  if (!enabled) {
    return (
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
      </div>
    );
  }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Deep space background */}
      <div className="absolute inset-0 bg-[#050510]" />
      
      {/* Subtle space gradient */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% 50%, hsl(var(--primary) / 0.08), transparent 60%),
            radial-gradient(ellipse 80% 60% at 20% 60%, hsl(240, 60%, 20% / 0.4), transparent 50%),
            radial-gradient(ellipse 60% 50% at 85% 30%, hsl(280, 40%, 15% / 0.3), transparent 45%)
          `,
        }}
      />

      {/* Andromeda Galaxy (distant) */}
      <motion.div
        className="absolute"
        style={{
          right: "8%",
          top: "12%",
          width: 120,
          height: 50,
          ...(animated ? { x: parallaxX, y: parallaxY } : {}),
        }}
      >
        <motion.div
          className="relative w-full h-full"
          style={{
            background: `
              radial-gradient(ellipse 100% 40% at 50% 50%, 
                hsl(260, 50%, 70% / 0.15) 0%, 
                hsl(280, 40%, 50% / 0.08) 30%, 
                transparent 70%)
            `,
            transform: "rotate(-25deg)",
            filter: "blur(2px)",
          }}
          animate={animated ? { opacity: [0.4, 0.6, 0.4] } : { opacity: 0.5 }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Galaxy core */}
        <div
          className="absolute left-1/2 top-1/2 w-3 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(ellipse, hsl(270, 50%, 80% / 0.4), transparent 70%)",
            transform: "rotate(-25deg)",
          }}
        />
      </motion.div>

      {/* Distant Stars */}
      <motion.div 
        className="absolute inset-0"
        style={animated ? { x: parallaxX, y: parallaxY } : {}}
      >
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              background: `radial-gradient(circle, hsl(45, 80%, 90% / ${star.opacity}), transparent 70%)`,
              boxShadow: `0 0 ${star.size * 3}px hsl(45, 70%, 80% / ${star.opacity * 0.4})`,
            }}
            animate={animated ? {
              opacity: [star.opacity * 0.5, star.opacity, star.opacity * 0.5],
              scale: [0.9, 1.1, 0.9],
            } : { opacity: star.opacity * 0.7 }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Solar System Container - centered with responsive scaling */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ 
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Sun */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 24,
            height: 24,
            background: "radial-gradient(circle at 35% 35%, hsl(45, 100%, 75%), hsl(35, 100%, 55%) 50%, hsl(25, 100%, 45%) 100%)",
            boxShadow: `
              0 0 30px hsl(45, 100%, 65% / 0.8),
              0 0 60px hsl(35, 100%, 55% / 0.5),
              0 0 100px hsl(25, 100%, 50% / 0.3)
            `,
          }}
          animate={animated ? {
            boxShadow: [
              "0 0 30px hsl(45, 100%, 65% / 0.8), 0 0 60px hsl(35, 100%, 55% / 0.5), 0 0 100px hsl(25, 100%, 50% / 0.3)",
              "0 0 40px hsl(45, 100%, 70% / 0.9), 0 0 80px hsl(35, 100%, 60% / 0.6), 0 0 120px hsl(25, 100%, 55% / 0.4)",
              "0 0 30px hsl(45, 100%, 65% / 0.8), 0 0 60px hsl(35, 100%, 55% / 0.5), 0 0 100px hsl(25, 100%, 50% / 0.3)",
            ],
          } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Orbit lines */}
        <svg
          className="absolute"
          width="700"
          height="700"
          viewBox="-350 -350 700 700"
          style={{ opacity: 0.35 }}
        >
          {planets.map((planet) => (
            <circle
              key={planet.name}
              cx="0"
              cy="0"
              r={planet.radius}
              fill="none"
              stroke="hsl(var(--primary) / 0.5)"
              strokeWidth="0.8"
              strokeDasharray="3 3"
            />
          ))}
          {/* Main asteroid belt orbit indicator */}
          <circle cx="0" cy="0" r="130" fill="none" stroke="hsl(30, 40%, 50% / 0.25)" strokeWidth="20" />
          {/* Kuiper belt orbit indicator */}
          <circle cx="0" cy="0" r="300" fill="none" stroke="hsl(200, 30%, 40% / 0.2)" strokeWidth="40" />
        </svg>

        {/* Main Asteroid Belt */}
        <motion.div
          className="absolute"
          style={{ width: 0, height: 0 }}
          animate={animated ? { rotate: 360 } : {}}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
        >
          {mainBeltAsteroids.map((asteroid) => (
            <div
              key={`main-${asteroid.id}`}
              className="absolute rounded-full"
              style={{
                left: Math.cos(asteroid.angle) * asteroid.radius,
                top: Math.sin(asteroid.angle) * asteroid.radius,
                width: asteroid.size,
                height: asteroid.size,
                background: `hsl(30, 30%, 55% / ${asteroid.opacity})`,
                boxShadow: `0 0 ${asteroid.size * 2}px hsl(30, 25%, 50% / ${asteroid.opacity * 0.5})`,
              }}
            />
          ))}
        </motion.div>

        {/* Kuiper Belt */}
        <motion.div
          className="absolute"
          style={{ width: 0, height: 0 }}
          animate={animated ? { rotate: -360 } : {}}
          transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
        >
          {kuiperBeltAsteroids.map((asteroid) => (
            <div
              key={`kuiper-${asteroid.id}`}
              className="absolute rounded-full"
              style={{
                left: Math.cos(asteroid.angle) * asteroid.radius,
                top: Math.sin(asteroid.angle) * asteroid.radius,
                width: asteroid.size,
                height: asteroid.size,
                background: `hsl(200, 25%, 55% / ${asteroid.opacity * 0.8})`,
              }}
            />
          ))}
        </motion.div>

        {/* Planets with moons */}
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
                  background: `radial-gradient(circle at 30% 30%, ${planet.color}, ${planet.color.replace(')', ' / 0.7)')})`,
                  boxShadow: `0 0 ${planet.size * 1.5}px ${planet.color.replace(')', ' / 0.5)')}`,
                }}
              >
                {/* Saturn's rings */}
                {planet.hasRings && (
                  <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      width: planet.size * 2.2,
                      height: planet.size * 0.5,
                      border: `1.5px solid hsl(45, 40%, 60% / 0.6)`,
                      borderRadius: "50%",
                      transform: "translate(-50%, -50%) rotateX(70deg)",
                    }}
                  />
                )}
              </div>

              {/* Moons */}
              {planet.moons > 0 && (
                <motion.div
                  className="absolute"
                  style={{
                    left: planet.size / 2,
                    top: planet.size / 2,
                    width: 0,
                    height: 0,
                  }}
                  animate={animated ? { rotate: -720 } : {}}
                  transition={{ duration: planet.duration / 3, repeat: Infinity, ease: "linear" }}
                >
                  {Array.from({ length: Math.min(planet.moons, 4) }).map((_, moonIndex) => {
                    const moonOrbitRadius = planet.size * 0.9 + moonIndex * 3;
                    const moonAngle = (moonIndex / planet.moons) * Math.PI * 2;
                    return (
                      <div
                        key={moonIndex}
                        className="absolute rounded-full"
                        style={{
                          left: Math.cos(moonAngle) * moonOrbitRadius,
                          top: Math.sin(moonAngle) * moonOrbitRadius,
                          width: planet.moonSize || 2,
                          height: planet.moonSize || 2,
                          background: "hsl(0, 0%, 75%)",
                          boxShadow: "0 0 4px hsl(0, 0%, 85% / 0.6)",
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    );
                  })}
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Subtle grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}
