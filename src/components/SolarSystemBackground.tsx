import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo } from "react";

interface SolarSystemBackgroundProps {
  enabled?: boolean;
}

// Planet data with orbital parameters
const planets = [
  { name: "Mercury", radius: 60, size: 4, duration: 15, color: "hsl(35, 30%, 55%)", moons: 0 },
  { name: "Venus", radius: 90, size: 6, duration: 22, color: "hsl(40, 50%, 65%)", moons: 0 },
  { name: "Earth", radius: 125, size: 7, duration: 30, color: "hsl(200, 60%, 50%)", moons: 1, moonSize: 2 },
  { name: "Mars", radius: 165, size: 5, duration: 38, color: "hsl(15, 60%, 45%)", moons: 2, moonSize: 1.5 },
  { name: "Jupiter", radius: 240, size: 16, duration: 55, color: "hsl(30, 45%, 55%)", moons: 4, moonSize: 2 },
  { name: "Saturn", radius: 310, size: 14, duration: 70, color: "hsl(45, 40%, 60%)", moons: 3, moonSize: 1.8, hasRings: true },
  { name: "Uranus", radius: 380, size: 10, duration: 90, color: "hsl(180, 40%, 55%)", moons: 2, moonSize: 1.5 },
  { name: "Neptune", radius: 440, size: 9, duration: 110, color: "hsl(220, 50%, 50%)", moons: 1, moonSize: 1.8 },
  { name: "Pluto", radius: 500, size: 3, duration: 140, color: "hsl(30, 20%, 50%)", moons: 1, moonSize: 1 },
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

export default function SolarSystemBackground({ enabled = true }: SolarSystemBackgroundProps) {
  const reduceMotion = useReducedMotion();
  
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

  // Memoize generated elements
  const stars = useMemo(() => generateStars(35), []);
  const mainBeltAsteroids = useMemo(() => generateAsteroids(60, 195, 220), []);
  const kuiperBeltAsteroids = useMemo(() => generateAsteroids(80, 470, 540), []);

  const animated = !reduceMotion && enabled;

  if (!enabled) {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
      </div>
    );
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Deep space background */}
      <div className="absolute inset-0 bg-[#030308]" />
      
      {/* Subtle space gradient */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% 40%, hsl(var(--primary) / 0.06), transparent 60%),
            radial-gradient(ellipse 80% 60% at 20% 60%, hsl(240, 60%, 15% / 0.3), transparent 50%),
            radial-gradient(ellipse 60% 50% at 85% 30%, hsl(280, 40%, 12% / 0.25), transparent 45%)
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

      {/* Solar System Container */}
      <div className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2">
        {/* Sun */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 28,
            height: 28,
            background: "radial-gradient(circle at 35% 35%, hsl(45, 100%, 70%), hsl(35, 100%, 50%) 50%, hsl(25, 100%, 40%) 100%)",
            boxShadow: `
              0 0 40px hsl(45, 100%, 60% / 0.6),
              0 0 80px hsl(35, 100%, 50% / 0.3),
              0 0 120px hsl(25, 100%, 45% / 0.15)
            `,
          }}
          animate={animated ? {
            boxShadow: [
              "0 0 40px hsl(45, 100%, 60% / 0.6), 0 0 80px hsl(35, 100%, 50% / 0.3), 0 0 120px hsl(25, 100%, 45% / 0.15)",
              "0 0 50px hsl(45, 100%, 60% / 0.7), 0 0 100px hsl(35, 100%, 50% / 0.4), 0 0 140px hsl(25, 100%, 45% / 0.2)",
              "0 0 40px hsl(45, 100%, 60% / 0.6), 0 0 80px hsl(35, 100%, 50% / 0.3), 0 0 120px hsl(25, 100%, 45% / 0.15)",
            ],
          } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Orbit lines */}
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          width="1100"
          height="1100"
          viewBox="-550 -550 1100 1100"
          style={{ opacity: 0.25 }}
        >
          {planets.map((planet) => (
            <circle
              key={planet.name}
              cx="0"
              cy="0"
              r={planet.radius}
              fill="none"
              stroke="hsl(var(--primary) / 0.4)"
              strokeWidth="0.5"
              strokeDasharray="4 4"
            />
          ))}
          {/* Main asteroid belt orbit indicator */}
          <circle cx="0" cy="0" r="207" fill="none" stroke="hsl(30, 40%, 40% / 0.2)" strokeWidth="25" />
          {/* Kuiper belt orbit indicator */}
          <circle cx="0" cy="0" r="505" fill="none" stroke="hsl(200, 30%, 30% / 0.15)" strokeWidth="70" />
        </svg>

        {/* Main Asteroid Belt */}
        <motion.div
          className="absolute left-1/2 top-1/2"
          style={{ width: 0, height: 0 }}
          animate={animated ? { rotate: 360 } : {}}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
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
                background: `hsl(30, 25%, 45% / ${asteroid.opacity})`,
                boxShadow: `0 0 ${asteroid.size}px hsl(30, 20%, 40% / ${asteroid.opacity * 0.3})`,
              }}
            />
          ))}
        </motion.div>

        {/* Kuiper Belt */}
        <motion.div
          className="absolute left-1/2 top-1/2"
          style={{ width: 0, height: 0 }}
          animate={animated ? { rotate: -360 } : {}}
          transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
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
                background: `hsl(200, 20%, 50% / ${asteroid.opacity * 0.7})`,
              }}
            />
          ))}
        </motion.div>

        {/* Planets with moons */}
        {planets.map((planet) => (
          <motion.div
            key={planet.name}
            className="absolute left-1/2 top-1/2"
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
                  boxShadow: `0 0 ${planet.size}px ${planet.color.replace(')', ' / 0.3)')}`,
                }}
              >
                {/* Saturn's rings */}
                {planet.hasRings && (
                  <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      width: planet.size * 2.2,
                      height: planet.size * 0.5,
                      border: `1px solid hsl(45, 35%, 55% / 0.5)`,
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
                    const moonOrbitRadius = planet.size * 0.9 + moonIndex * 4;
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
                          background: "hsl(0, 0%, 70%)",
                          boxShadow: "0 0 3px hsl(0, 0%, 80% / 0.5)",
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
