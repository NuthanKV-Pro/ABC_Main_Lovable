import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Rocket, Users, Briefcase, Sparkles, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuroraBackground from "@/components/AuroraBackground";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <AuroraBackground />
      
      <motion.div
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.2, delayChildren: 0.3 }}
      >
        {/* Logo/Title */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 12 }}
          className="mb-8"
        >
          <motion.div
            className="inline-flex items-center gap-3 mb-4"
            animate={{ 
              textShadow: [
                "0 0 20px hsl(var(--primary) / 0.5)",
                "0 0 40px hsl(var(--primary) / 0.8)",
                "0 0 20px hsl(var(--primary) / 0.5)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
            <h1 className="text-5xl sm:text-7xl font-bold text-white tracking-tight">
              ABC
            </h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.2 }}
            className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto"
          >
            Democratising The Expertise
          </motion.p>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            textShadow: [
              "0 0 10px rgba(251, 191, 36, 0.4), 0 0 20px rgba(251, 191, 36, 0.2)",
              "0 0 20px rgba(251, 191, 36, 0.6), 0 0 40px rgba(251, 191, 36, 0.4)",
              "0 0 10px rgba(251, 191, 36, 0.4), 0 0 20px rgba(251, 191, 36, 0.2)",
            ]
          }}
          transition={{ 
            opacity: { type: "spring", stiffness: 100, damping: 12, delay: 0.4 },
            y: { type: "spring", stiffness: 100, damping: 12, delay: 0.4 },
            textShadow: { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
          }}
          className="text-amber-400 text-lg sm:text-xl mb-12 max-w-xl mx-auto font-medium"
        >
          Sky was never the limit ✨
        </motion.p>

        {/* Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {/* Explore Prototypes Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.7 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div 
              animate={{
                boxShadow: [
                  "0 0 20px hsl(var(--primary) / 0.3)",
                  "0 0 40px hsl(var(--primary) / 0.5)",
                  "0 0 20px hsl(var(--primary) / 0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-xl"
            >
              <Button
                size="lg"
                className="h-auto py-4 px-6 sm:px-8 text-base sm:text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg"
                onClick={() => navigate("/prototypes")}
              >
                <Rocket className="mr-2 h-5 w-5" />
                <span className="flex flex-col items-start">
                  <span>Explore Working Prototypes</span>
                  <span className="text-xs font-normal opacity-80">Modules & Tools</span>
                </span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Client-side MVP Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <Button
                size="lg"
                variant="outline"
                className="h-auto py-4 px-6 sm:px-8 text-base sm:text-lg font-semibold border-2 border-white/30 bg-white/5 hover:bg-white/10 text-white rounded-xl backdrop-blur-sm"
                onClick={() => window.open("https://abcmvpb2c.lovable.app", "_blank", "noopener,noreferrer")}
              >
                <Users className="mr-2 h-5 w-5 text-amber-400" />
                <span className="flex flex-col items-start">
                  <span className="text-amber-400">Client-side Application</span>
                  <span className="text-xs font-normal opacity-70">MVP Demo</span>
                </span>
              </Button>
              <motion.div
                className="absolute pointer-events-none"
                style={{ top: "-6px", right: "-6px" }}
                animate={{
                  x: [0, -20, -40, -20, 0, 20, 40, 20, 0],
                  y: [0, -8, 0, 8, 12, 8, 0, -8, 0],
                  scale: [1, 1.2, 1, 0.9, 1, 1.2, 1, 0.9, 1],
                  rotate: [0, 45, 90, 135, 180, 225, 270, 315, 360],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]" />
              </motion.div>
            </div>
          </motion.div>

          {/* Client-side MVP V2 Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.85 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <Button
                size="lg"
                variant="outline"
                className="h-auto py-4 px-6 sm:px-8 text-base sm:text-lg font-semibold border-2 border-amber-400/40 bg-amber-400/5 hover:bg-amber-400/10 text-white rounded-xl backdrop-blur-sm"
                onClick={() => window.open("https://abcmvpb2cv2.lovable.app", "_blank", "noopener,noreferrer")}
              >
                <Users className="mr-2 h-5 w-5 text-amber-400" />
                <span className="flex flex-col items-start">
                  <span className="text-amber-400">Client-side Application</span>
                  <span className="text-xs font-normal opacity-70">MVP Demo — Version 2</span>
                </span>
              </Button>
              <motion.div
                className="absolute pointer-events-none"
                style={{ top: "-6px", right: "-6px" }}
                animate={{
                  x: [0, 20, 40, 20, 0, -20, -40, -20, 0],
                  y: [0, -8, 0, 8, 12, 8, 0, -8, 0],
                  scale: [1, 1.2, 1, 0.9, 1, 1.2, 1, 0.9, 1],
                  rotate: [0, -45, -90, -135, -180, -225, -270, -315, -360],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]" />
              </motion.div>
            </div>
          </motion.div>

          {/* Consultant-side MVP Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              variant="outline"
              className="h-auto py-4 px-6 sm:px-8 text-base sm:text-lg font-semibold border-2 border-white/30 bg-white/5 hover:bg-white/10 text-white rounded-xl backdrop-blur-sm"
              onClick={() => window.open("https://abcmvpb2b.lovable.app", "_blank", "noopener,noreferrer")}
            >
              <Briefcase className="mr-2 h-5 w-5 text-amber-400" />
              <span className="flex flex-col items-start">
                <span className="text-amber-400">Consultant-side Application</span>
                <span className="text-xs font-normal opacity-70">MVP Demo</span>
              </span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Footer text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 12, delay: 1.1 }}
          className="mt-16 text-white/40 text-xs sm:text-sm"
        >
          Built with ❤️‍🔥 by{" "}
          <motion.span 
            className="text-amber-400 font-medium"
            animate={{
              textShadow: [
                "0 0 10px rgba(251, 191, 36, 0.4), 0 0 20px rgba(251, 191, 36, 0.2)",
                "0 0 20px rgba(251, 191, 36, 0.6), 0 0 40px rgba(251, 191, 36, 0.4)",
                "0 0 10px rgba(251, 191, 36, 0.4), 0 0 20px rgba(251, 191, 36, 0.2)",
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            Nuthan Kaparthy
          </motion.span>
        </motion.p>
      </motion.div>

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
