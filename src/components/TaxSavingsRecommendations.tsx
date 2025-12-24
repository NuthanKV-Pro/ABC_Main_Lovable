import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Lightbulb, 
  PiggyBank, 
  Heart, 
  Home, 
  GraduationCap, 
  Shield, 
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

interface IncomeValues {
  salary: number;
  hp: number;
  pgbp: number;
  cg: number;
  os: number;
}

interface TaxSavingsRecommendationsProps {
  incomeValues: IncomeValues;
}

interface Recommendation {
  id: string;
  title: string;
  section: string;
  maxLimit: number;
  currentUsed: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  priority: "high" | "medium" | "low";
  tips: string[];
}

const TaxSavingsRecommendations = ({ incomeValues }: TaxSavingsRecommendationsProps) => {
  const grossIncome = Object.values(incomeValues).reduce((sum, val) => sum + val, 0);

  // Simulate used deductions (in real app, these would come from stored data)
  const usedDeductions = useMemo(() => ({
    section80C: parseFloat(localStorage.getItem('deduction_80C') || '0'),
    section80D: parseFloat(localStorage.getItem('deduction_80D') || '0'),
    section80E: parseFloat(localStorage.getItem('deduction_80E') || '0'),
    section80G: parseFloat(localStorage.getItem('deduction_80G') || '0'),
    section80TTA: parseFloat(localStorage.getItem('deduction_80TTA') || '0'),
    section24b: parseFloat(localStorage.getItem('deduction_24b') || '0'),
    nps80CCD: parseFloat(localStorage.getItem('deduction_80CCD') || '0'),
  }), []);

  const recommendations: Recommendation[] = useMemo(() => [
    {
      id: "80C",
      title: "Section 80C Investments",
      section: "80C",
      maxLimit: 150000,
      currentUsed: usedDeductions.section80C,
      description: "Invest in PPF, ELSS, LIC, NSC, or Tax Saver FDs",
      icon: PiggyBank,
      priority: usedDeductions.section80C < 150000 ? "high" : "low",
      tips: [
        "EPF contributions count towards 80C limit",
        "ELSS has lowest lock-in of 3 years",
        "PPF offers tax-free returns with 15-year lock-in",
        "Children's tuition fees are also eligible"
      ]
    },
    {
      id: "80D",
      title: "Health Insurance Premium",
      section: "80D",
      maxLimit: 75000,
      currentUsed: usedDeductions.section80D,
      description: "Self, family & parents health insurance premiums",
      icon: Heart,
      priority: usedDeductions.section80D < 25000 ? "high" : "medium",
      tips: [
        "₹25,000 for self & family",
        "Additional ₹25,000 for parents (₹50,000 if senior citizen)",
        "Preventive health checkup included up to ₹5,000",
        "Covers critical illness riders too"
      ]
    },
    {
      id: "24b",
      title: "Home Loan Interest",
      section: "24(b)",
      maxLimit: 200000,
      currentUsed: usedDeductions.section24b,
      description: "Interest on housing loan for self-occupied property",
      icon: Home,
      priority: usedDeductions.section24b === 0 && grossIncome > 1000000 ? "high" : "low",
      tips: [
        "Up to ₹2 lakh deduction for self-occupied property",
        "No limit for let-out property",
        "Pre-construction interest claimable in 5 equal installments",
        "Both co-borrowers can claim separately"
      ]
    },
    {
      id: "80CCD",
      title: "NPS Contribution",
      section: "80CCD(1B)",
      maxLimit: 50000,
      currentUsed: usedDeductions.nps80CCD,
      description: "Additional NPS contribution beyond 80C",
      icon: Shield,
      priority: usedDeductions.nps80CCD === 0 ? "high" : "low",
      tips: [
        "Extra ₹50,000 deduction over 80C limit",
        "Employer contribution up to 10% of salary under 80CCD(2)",
        "Partial withdrawal allowed after 3 years",
        "Good for retirement planning with tax benefits"
      ]
    },
    {
      id: "80E",
      title: "Education Loan Interest",
      section: "80E",
      maxLimit: Infinity,
      currentUsed: usedDeductions.section80E,
      description: "Interest on higher education loan",
      icon: GraduationCap,
      priority: "medium",
      tips: [
        "No upper limit on deduction",
        "Available for 8 years from start of repayment",
        "Covers loans for self, spouse, or children",
        "Only interest component is deductible, not principal"
      ]
    },
    {
      id: "80TTA",
      title: "Savings Account Interest",
      section: "80TTA/80TTB",
      maxLimit: 10000,
      currentUsed: usedDeductions.section80TTA,
      description: "Interest from savings bank accounts",
      icon: TrendingUp,
      priority: usedDeductions.section80TTA < 10000 ? "medium" : "low",
      tips: [
        "Up to ₹10,000 for non-senior citizens (80TTA)",
        "Up to ₹50,000 for senior citizens (80TTB)",
        "Includes all savings accounts",
        "FD interest not covered under 80TTA"
      ]
    },
  ], [usedDeductions, grossIncome]);

  const totalPotentialSavings = recommendations.reduce((sum, rec) => {
    const unused = Math.max(0, rec.maxLimit === Infinity ? 0 : rec.maxLimit - rec.currentUsed);
    return sum + unused;
  }, 0);

  const taxSaved = Math.round(totalPotentialSavings * 0.3); // Assuming 30% tax bracket

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (grossIncome === 0) {
    return (
      <Card className="border-2 border-dashed border-muted">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Enter your income details to get personalized tax saving recommendations
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Tax Savings Recommendations</CardTitle>
              <CardDescription>Based on your income of ₹{grossIncome.toLocaleString('en-IN')}</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Potential Savings</p>
            <p className="text-2xl font-bold text-primary">₹{taxSaved.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations
          .filter(rec => rec.priority === "high" || rec.currentUsed < rec.maxLimit)
          .slice(0, 5)
          .map((rec) => {
            const Icon = rec.icon;
            const unusedLimit = rec.maxLimit === Infinity ? rec.currentUsed : rec.maxLimit - rec.currentUsed;
            const usagePercent = rec.maxLimit === Infinity ? 100 : (rec.currentUsed / rec.maxLimit) * 100;
            const isFullyUsed = rec.currentUsed >= rec.maxLimit && rec.maxLimit !== Infinity;

            return (
              <div 
                key={rec.id}
                className={`p-4 rounded-lg border ${isFullyUsed ? 'bg-muted/30 border-muted' : 'bg-card border-border hover:border-primary/30'} transition-colors`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${isFullyUsed ? 'bg-muted' : 'bg-primary/10'}`}>
                    <Icon className={`w-5 h-5 ${isFullyUsed ? 'text-muted-foreground' : 'text-primary'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-medium truncate">{rec.title}</h4>
                      <div className="flex items-center gap-2">
                        {isFullyUsed ? (
                          <Badge variant="outline" className="gap-1 shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                            Utilized
                          </Badge>
                        ) : (
                          <Badge className={`${getPriorityColor(rec.priority)} shrink-0`}>
                            {rec.priority} priority
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                    
                    {rec.maxLimit !== Infinity && (
                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Used: ₹{rec.currentUsed.toLocaleString('en-IN')}</span>
                          <span>Limit: ₹{rec.maxLimit.toLocaleString('en-IN')}</span>
                        </div>
                        <Progress value={Math.min(usagePercent, 100)} className="h-2" />
                      </div>
                    )}

                    {!isFullyUsed && unusedLimit > 0 && rec.maxLimit !== Infinity && (
                      <p className="text-sm font-medium text-primary">
                        💡 You can still invest ₹{unusedLimit.toLocaleString('en-IN')} under Section {rec.section}
                      </p>
                    )}

                    <div className="mt-2 space-y-1">
                      {rec.tips.slice(0, 2).map((tip, idx) => (
                        <p key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                          <span className="text-primary">•</span>
                          {tip}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </CardContent>
    </Card>
  );
};

export default TaxSavingsRecommendations;
