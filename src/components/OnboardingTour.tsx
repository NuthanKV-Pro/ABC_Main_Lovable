import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calculator, 
  Wrench, 
  Search, 
  Star, 
  ArrowRight, 
  X, 
  Sparkles,
  CheckCircle2,
  Rocket
} from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: string; // CSS selector or section identifier
  position: "center" | "top" | "bottom";
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to ABC! 🎉",
    description: "Your AI-powered Legal & Tax Co-pilot. Let's take a quick tour to help you get started with the most powerful financial tools.",
    icon: Rocket,
    position: "center"
  },
  {
    id: "modules",
    title: "Core Modules",
    description: "Access comprehensive modules for Income Tax, GST, Financial Ratios, MCA filings, and more. Each module is designed for deep, specialized work.",
    icon: Calculator,
    highlight: "modules",
    position: "top"
  },
  {
    id: "featured",
    title: "Featured Tools ⭐",
    description: "Our premium tools include Tax Loss Harvesting, Deduction Playground, Contract Drafter, and Insurance Real Return Calculator. Look for the gold star!",
    icon: Star,
    highlight: "featured",
    position: "bottom"
  },
  {
    id: "tools",
    title: "50+ Amazing Tools",
    description: "From SIP & EMI calculators to Stock Portfolio Tracker and Capital Budgeting—everything you need for complete financial planning.",
    icon: Wrench,
    highlight: "tools",
    position: "bottom"
  },
  {
    id: "search",
    title: "Quick Search",
    description: "Press the search bar or use keyboard shortcuts to instantly find any tool. Try pressing 'D' for Dashboard or 'S' for SIP Calculator!",
    icon: Search,
    highlight: "search",
    position: "top"
  },
  {
    id: "complete",
    title: "You're All Set!",
    description: "Start exploring the tools that matter most to you. Your data stays local and secure. Happy planning!",
    icon: CheckCircle2,
    position: "center"
  }
];

const TOUR_STORAGE_KEY = "abc-onboarding-completed";

interface OnboardingTourProps {
  onComplete?: () => void;
}

const OnboardingTour = ({ onComplete }: OnboardingTourProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(true);

  useEffect(() => {
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!tourCompleted) {
      setHasSeenTour(false);
      // Small delay to let the page render first
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    completeTour();
  };

  const completeTour = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    setIsVisible(false);
    setHasSeenTour(true);
    onComplete?.();
  };

  const resetTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    setCurrentStep(0);
    setHasSeenTour(false);
    setIsVisible(true);
  };

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  if (hasSeenTour) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
            onClick={handleSkip}
          />

          {/* Tour card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed z-[101] left-1/2 -translate-x-1/2 w-[90%] max-w-md ${
              step.position === "center" 
                ? "top-1/2 -translate-y-1/2" 
                : step.position === "top" 
                  ? "top-24" 
                  : "bottom-24"
            }`}
          >
            <Card className="border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden">
              {/* Progress bar */}
              <div className="h-1 bg-muted">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary/60"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <CardContent className="p-6">
                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={handleSkip}
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-muted-foreground font-medium">
                    Step {currentStep + 1} of {tourSteps.length}
                  </span>
                  <div className="flex gap-1">
                    {tourSteps.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          idx === currentStep 
                            ? "bg-primary" 
                            : idx < currentStep 
                              ? "bg-primary/40" 
                              : "bg-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Icon */}
                <motion.div
                  key={step.id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4"
                >
                  <step.icon className="w-8 h-8 text-primary" />
                </motion.div>

                {/* Content */}
                <motion.div
                  key={`content-${step.id}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {step.description}
                  </p>
                </motion.div>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Skip tour
                  </Button>

                  <div className="flex gap-2">
                    {currentStep > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevious}
                      >
                        Back
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={handleNext}
                      className="gap-2"
                    >
                      {currentStep === tourSteps.length - 1 ? (
                        <>
                          Get Started
                          <Sparkles className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Next
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Highlight indicator for specific sections */}
          {step.highlight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed z-[99] pointer-events-none"
              style={{
                top: step.highlight === "search" ? "60px" : step.highlight === "modules" ? "200px" : "auto",
                bottom: step.highlight === "featured" || step.highlight === "tools" ? "200px" : "auto",
                left: "50%",
                transform: "translateX(-50%)"
              }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-32 h-32 rounded-full bg-primary/20 blur-xl"
              />
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

// Export a button to restart the tour
export const RestartTourButton = () => {
  const handleRestart = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    window.location.reload();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRestart}
      className="gap-2"
    >
      <Rocket className="w-4 h-4" />
      Restart Tour
    </Button>
  );
};

export default OnboardingTour;
