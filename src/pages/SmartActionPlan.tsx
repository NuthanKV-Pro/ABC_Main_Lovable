import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, AlertTriangle, CheckCircle2, ArrowRight, Info, Lightbulb, TrendingUp, Shield, Wallet, PiggyBank, Target, BarChart3, Percent } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import { useTaxData } from "@/hooks/useTaxData";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

type Priority = "high" | "medium" | "low";

interface ActionItem {
  id: string;
  priority: Priority;
  title: string;
  description: string;
  route: string;
  routeLabel: string;
  category: string;
  icon: React.ElementType;
}

const priorityConfig: Record<Priority, { label: string; color: string; badgeVariant: string; borderColor: string }> = {
  high: { label: "High Priority", color: "text-red-500", badgeVariant: "bg-red-500/15 text-red-500 border-red-500/30", borderColor: "border-l-red-500" },
  medium: { label: "Medium Priority", color: "text-amber-500", badgeVariant: "bg-amber-500/15 text-amber-500 border-amber-500/30", borderColor: "border-l-amber-500" },
  low: { label: "Low Priority", color: "text-blue-500", badgeVariant: "bg-blue-500/15 text-blue-500 border-blue-500/30", borderColor: "border-l-blue-500" },
};

function formatCurrency(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n.toFixed(0)}`;
}

function generateActions(taxData: ReturnType<typeof useTaxData>): ActionItem[] {
  const actions: ActionItem[] = [];
  const { salary, deductions, grossTotal, totalDeductions, capitalGains, business, houseProperty, otherSources } = taxData;

  // --- Read additional localStorage data for richer analysis ---
  const getNum = (key: string) => { const v = parseFloat(localStorage.getItem(key) || "0"); return isNaN(v) ? 0 : v; };
  const monthlyIncome = salary.total > 0 ? salary.total / 12 : getNum("fhs_monthlyIncome");
  const emergencyFund = getNum("fhs_emergencyFund");
  const totalDebt = getNum("fhs_totalDebt");
  const monthlyDebtPayment = getNum("fhs_monthlyDebtPayment");
  const insuranceCoverage = getNum("fhs_insuranceCoverage");
  const monthlyExpenses = getNum("fhs_monthlyExpenses");
  const retirementCorpus = getNum("fhs_retirementCorpus");
  const age = getNum("fhs_age") || 30;
  const monthlySavings = getNum("fhs_monthlySavings");
  const totalInvestments = getNum("fhs_totalInvestments");
  const annualIncome = salary.total > 0 ? salary.total : monthlyIncome * 12;

  // ========== 80C DEDUCTIONS ==========
  const section80C = deductions.data?.["80C"] || 0;
  const limit80C = 150000;
  const unused80C = limit80C - section80C;
  if (unused80C > 10000) {
    actions.push({
      id: "80c-gap",
      priority: unused80C > 100000 ? "high" : "medium",
      title: `You're not using ${formatCurrency(unused80C)} of your 80C limit`,
      description: `You've claimed only ${formatCurrency(section80C)} of the ₹1.5L limit under Section 80C. Invest in ELSS, PPF, or NPS to save up to ${formatCurrency(Math.round(unused80C * 0.3))} in taxes.`,
      route: "/80c-optimizer",
      routeLabel: "Open 80C Optimizer",
      category: "Tax Savings",
      icon: PiggyBank,
    });
  }

  // ========== NO DEDUCTIONS AT ALL ==========
  if (grossTotal > 500000 && totalDeductions === 0) {
    actions.push({
      id: "no-deductions",
      priority: "high",
      title: "You haven't claimed any tax deductions",
      description: `With a gross income of ${formatCurrency(grossTotal)}, you're paying more tax than needed. Explore 80C, 80D, HRA, and other deductions.`,
      route: "/deduction-playground",
      routeLabel: "Explore Deductions",
      category: "Tax Savings",
      icon: Target,
    });
  }

  // ========== 80D HEALTH INSURANCE ==========
  const section80D = deductions.data?.["80D"] || 0;
  if (section80D === 0 && grossTotal > 300000) {
    actions.push({
      id: "no-health-insurance",
      priority: "high",
      title: "No health insurance premium claimed (Section 80D)",
      description: "You can save up to ₹75,000 under 80D for health insurance premiums for self, family & parents.",
      route: "/insurance-premium-calculator",
      routeLabel: "Check Insurance Premium",
      category: "Insurance",
      icon: Shield,
    });
  }

  // ========== DEBT-TO-INCOME ==========
  if (monthlyIncome > 0 && monthlyDebtPayment > 0) {
    const dti = (monthlyDebtPayment / monthlyIncome) * 100;
    if (dti > 40) {
      actions.push({
        id: "high-dti",
        priority: "high",
        title: `Your debt-to-income ratio is ${dti.toFixed(0)}%`,
        description: `You're spending ${formatCurrency(monthlyDebtPayment)}/month on debt against ${formatCurrency(monthlyIncome)}/month income. A DTI above 40% is risky. Consider restructuring.`,
        route: "/debt-to-income",
        routeLabel: "Analyze Debt-to-Income",
        category: "Debt Management",
        icon: AlertTriangle,
      });
    } else if (dti > 30) {
      actions.push({
        id: "moderate-dti",
        priority: "medium",
        title: `Your debt-to-income ratio is ${dti.toFixed(0)}% — room to improve`,
        description: "A DTI between 30-40% is manageable but leaves less room for savings. See if you can optimize.",
        route: "/loan-advisor",
        routeLabel: "See Loan Advisor",
        category: "Debt Management",
        icon: Wallet,
      });
    }
  }

  // ========== EMERGENCY FUND ==========
  if (monthlyExpenses > 0) {
    const monthsCovered = emergencyFund / monthlyExpenses;
    if (monthsCovered < 3) {
      const target = monthlyExpenses * 6;
      actions.push({
        id: "emergency-fund",
        priority: monthsCovered < 1 ? "high" : "medium",
        title: monthsCovered < 1
          ? "You have no meaningful emergency fund"
          : `Emergency fund covers only ${monthsCovered.toFixed(1)} months`,
        description: `Target at least ${formatCurrency(target)} (6 months of expenses). Currently: ${formatCurrency(emergencyFund)}.`,
        route: "/emergency-fund",
        routeLabel: "Plan Emergency Fund",
        category: "Safety Net",
        icon: Shield,
      });
    }
  }

  // ========== INSURANCE COVERAGE ==========
  if (monthlyIncome > 0 && annualIncome > 0) {
    const coverageMultiple = insuranceCoverage / annualIncome;
    if (coverageMultiple < 5 && insuranceCoverage > 0) {
      actions.push({
        id: "low-insurance",
        priority: "medium",
        title: `Life insurance is only ${coverageMultiple.toFixed(1)}x your annual income`,
        description: `Financial advisors recommend 10-15x annual income. You need at least ${formatCurrency(annualIncome * 10)} in coverage.`,
        route: "/insurance-premium-calculator",
        routeLabel: "Calculate Premium",
        category: "Insurance",
        icon: Shield,
      });
    } else if (insuranceCoverage === 0 && annualIncome > 500000) {
      actions.push({
        id: "no-insurance",
        priority: "high",
        title: "No life insurance coverage recorded",
        description: "Life insurance is critical for income protection. Explore term plans — they're affordable.",
        route: "/insurance-comparison",
        routeLabel: "Compare Insurance Plans",
        category: "Insurance",
        icon: Shield,
      });
    }
  }

  // ========== TAX REGIME ==========
  if (grossTotal > 700000 && totalDeductions > 0) {
    actions.push({
      id: "regime-check",
      priority: "medium",
      title: "Check which tax regime saves you more",
      description: `With ${formatCurrency(grossTotal)} income and ${formatCurrency(totalDeductions)} in deductions, the optimal regime depends on your profile.`,
      route: "/regime-optimizer",
      routeLabel: "Optimize Regime",
      category: "Tax Planning",
      icon: TrendingUp,
    });
  }

  // ========== RETIREMENT ==========
  if (age > 25 && annualIncome > 0) {
    const targetCorpus = annualIncome * 25;
    if (retirementCorpus < targetCorpus * 0.1) {
      actions.push({
        id: "retirement-gap",
        priority: age > 40 ? "high" : "medium",
        title: "Retirement savings need attention",
        description: `At age ${age}, you should be building toward a corpus of ~${formatCurrency(targetCorpus)}. Start or increase NPS/PPF contributions.`,
        route: "/retirement-calculator",
        routeLabel: "Plan Retirement",
        category: "Retirement",
        icon: Target,
      });
    }
  }

  // ========== NPS ADDITIONAL DEDUCTION ==========
  const section80CCD = deductions.data?.["80CCD(1B)"] || deductions.data?.["80CCD"] || 0;
  if (section80CCD === 0 && grossTotal > 500000) {
    actions.push({
      id: "nps-deduction",
      priority: "low",
      title: "Claim extra ₹50K deduction via NPS (80CCD)",
      description: "Section 80CCD(1B) allows an additional ₹50,000 deduction over and above 80C. This can save ~₹15K in taxes.",
      route: "/nps-calculator",
      routeLabel: "Explore NPS",
      category: "Tax Savings",
      icon: PiggyBank,
    });
  }

  // ========== CAPITAL GAINS TAX HARVESTING ==========
  if (capitalGains.hasData && capitalGains.total > 100000) {
    actions.push({
      id: "tax-loss-harvest",
      priority: "medium",
      title: `Capital gains of ${formatCurrency(capitalGains.total)} — consider tax-loss harvesting`,
      description: "Offset gains by booking losses on underperforming investments before year-end.",
      route: "/tax-loss-harvesting",
      routeLabel: "Plan Harvesting",
      category: "Tax Planning",
      icon: TrendingUp,
    });
  }

  // ========== SALARY RESTRUCTURING ==========
  if (salary.total > 1000000 && totalDeductions < 100000) {
    actions.push({
      id: "salary-restructure",
      priority: "low",
      title: "High salary with low deductions — restructure?",
      description: "Negotiate HRA, LTA, meal vouchers, and other tax-efficient components with your employer.",
      route: "/salary-restructuring",
      routeLabel: "Optimize Salary",
      category: "Tax Planning",
      icon: Wallet,
    });
  }

  // ========== NO DATA AT ALL ==========
  if (grossTotal === 0 && totalDeductions === 0 && monthlyIncome === 0) {
    actions.push({
      id: "start-here",
      priority: "high",
      title: "Start by entering your income details",
      description: "Enter your salary, investments, and deductions in the Tax Dashboard to get personalized action items.",
      route: "/dashboard",
      routeLabel: "Go to Dashboard",
      category: "Getting Started",
      icon: Lightbulb,
    });
  }

  // Sort: high first, then medium, then low
  const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
  actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return actions;
}

const SmartActionPlan = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const taxData = useTaxData();

  const actions = useMemo(() => generateActions(taxData), [taxData]);

  const highCount = actions.filter(a => a.priority === "high").length;
  const mediumCount = actions.filter(a => a.priority === "medium").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Smart Action Plan
            </h1>
            <p className="text-sm text-muted-foreground">Personalized financial to-dos based on your data</p>
          </div>
          {actions.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              {highCount > 0 && (
                <span className="flex items-center gap-1 text-red-500 font-medium">
                  <AlertTriangle className="h-3.5 w-3.5" /> {highCount} urgent
                </span>
              )}
              {mediumCount > 0 && (
                <span className="flex items-center gap-1 text-amber-500 font-medium">
                  {mediumCount} to review
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Data sources summary */}
        <Card className="mb-6 border-dashed">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Analyzing data from:{" "}
                  {[
                    taxData.salary.hasData && "Salary",
                    taxData.capitalGains.hasData && "Capital Gains",
                    taxData.business.hasData && "Business Income",
                    taxData.houseProperty.hasData && "House Property",
                    taxData.otherSources.hasData && "Other Sources",
                    taxData.deductions.hasData && "Deductions",
                  ]
                    .filter(Boolean)
                    .join(", ") || "No data entered yet"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter more data in the Tax Dashboard and Financial Health Score for better recommendations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        {actions.length > 0 ? (
          <div className="space-y-4">
            {actions.map((action, i) => {
              const Icon = action.icon;
              const config = priorityConfig[action.priority];
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card className={`border-l-4 ${config.borderColor} hover:shadow-md transition-shadow`}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1 p-2 rounded-lg bg-muted/50">
                          <Icon className={`h-5 w-5 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-sm">{action.title}</h3>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${config.badgeVariant}`}>
                              {config.label}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {action.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            onClick={() => navigate(action.route)}
                          >
                            {action.routeLabel}
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card className="border-2 border-dashed">
            <CardContent className="py-16 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-1">You're in great shape!</h3>
              <p className="text-muted-foreground text-sm">No urgent actions found based on your current data.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default SmartActionPlan;
