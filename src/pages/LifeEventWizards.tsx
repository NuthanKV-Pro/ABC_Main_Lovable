import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Heart, Briefcase, Sunset, ChevronDown, ChevronUp, Play } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  title: string;
  description: string;
  route: string;
}

interface LifeEvent {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  borderColor: string;
  steps: Step[];
}

const lifeEvents: LifeEvent[] = [
  {
    id: "buying-house",
    title: "Buying a House",
    subtitle: "Navigate every financial step of homeownership",
    icon: Home,
    color: "from-emerald-500/20 to-teal-500/20",
    borderColor: "border-emerald-500/30",
    steps: [
      { title: "Home Affordability", description: "How much house can you afford?", route: "/home-affordability" },
      { title: "Home Loan Eligibility", description: "Check your loan eligibility & EMI capacity", route: "/home-loan-eligibility" },
      { title: "Stamp Duty Calculator", description: "Estimate registration & stamp duty costs", route: "/stamp-duty-calculator" },
      { title: "EMI Calculator", description: "Plan your monthly mortgage payments", route: "/emi-calculator" },
      { title: "Rent vs Buy", description: "Should you rent or buy? Data-driven answer", route: "/rent-vs-buy" },
      { title: "Section 54 Planner", description: "Save capital gains tax on property sale", route: "/section-54-planner" },
      { title: "Real Estate ROI", description: "Evaluate long-term return on your property", route: "/real-estate-roi" },
    ],
  },
  {
    id: "getting-married",
    title: "Getting Married",
    subtitle: "Plan finances for the big day and beyond",
    icon: Heart,
    color: "from-pink-500/20 to-rose-500/20",
    borderColor: "border-pink-500/30",
    steps: [
      { title: "Wedding Budget Planner", description: "Plan & track your wedding expenses", route: "/wedding-budget-planner" },
      { title: "Gold Loan Calculator", description: "Leverage gold assets for wedding finance", route: "/gold-loan-calculator" },
      { title: "Budget Planner", description: "Set up your new household budget", route: "/budget-planner" },
      { title: "Insurance Premium", description: "Get the right coverage for your family", route: "/insurance-premium-calculator" },
      { title: "Will & Estate Planner", description: "Protect your new family with proper planning", route: "/will-estate-planner" },
    ],
  },
  {
    id: "starting-business",
    title: "Starting a Business",
    subtitle: "Financial toolkit for entrepreneurs",
    icon: Briefcase,
    color: "from-amber-500/20 to-orange-500/20",
    borderColor: "border-amber-500/30",
    steps: [
      { title: "Business Valuation", description: "Understand what your business is worth", route: "/business-valuation" },
      { title: "Tax Audit Checker", description: "Check if tax audit applies to you", route: "/tax-audit-checker" },
      { title: "GST Invoice Generator", description: "Create compliant GST invoices", route: "/gst-invoice-generator" },
      { title: "Financial Statements", description: "Generate P&L, Balance Sheet & Cash Flow", route: "/financial-statements" },
      { title: "Startup Funding Guide", description: "Explore funding options for your venture", route: "/startup-funding-guide" },
      { title: "Compliance Calendar", description: "Never miss a filing deadline", route: "/compliance-calendar" },
    ],
  },
  {
    id: "planning-retirement",
    title: "Planning Retirement",
    subtitle: "Build a secure and comfortable retirement",
    icon: Sunset,
    color: "from-purple-500/20 to-indigo-500/20",
    borderColor: "border-purple-500/30",
    steps: [
      { title: "Retirement Calculator", description: "How much do you need to retire?", route: "/retirement-calculator" },
      { title: "FIRE Calculator", description: "Plan for financial independence & early retirement", route: "/fire-calculator" },
      { title: "NPS Calculator", description: "Optimize your National Pension Scheme", route: "/nps-calculator" },
      { title: "Gratuity Calculator", description: "Estimate your gratuity payout", route: "/gratuity-calculator" },
      { title: "PPF Calculator", description: "Project your PPF corpus growth", route: "/ppf-calculator" },
      { title: "SWP Calculator", description: "Plan systematic withdrawals in retirement", route: "/swp-calculator" },
    ],
  },
];

const LifeEventWizards = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const toggleEvent = (id: string) => {
    setExpandedEvent(expandedEvent === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Life Event Wizards</h1>
            <p className="text-sm text-muted-foreground">Guided financial flows for life's biggest moments</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-4">
          {lifeEvents.map((event, i) => {
            const Icon = event.icon;
            const isExpanded = expandedEvent === event.id;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card
                  className={`border-2 transition-all ${isExpanded ? event.borderColor : "hover:border-primary/20"}`}
                >
                  <CardHeader
                    className="cursor-pointer select-none"
                    onClick={() => toggleEvent(event.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${event.color}`}>
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{event.title}</CardTitle>
                          <CardDescription>{event.subtitle}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{event.steps.length} steps</span>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            {event.steps.map((step, stepIdx) => (
                              <div
                                key={step.route}
                                className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 cursor-pointer transition-colors group"
                                onClick={() => navigate(step.route)}
                              >
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                  {stepIdx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm">{step.title}</p>
                                  <p className="text-xs text-muted-foreground">{step.description}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => { e.stopPropagation(); navigate(step.route); }}
                                >
                                  <Play className="h-3 w-3 mr-1" /> Start
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default LifeEventWizards;
