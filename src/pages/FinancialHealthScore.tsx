import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Heart, Shield, PiggyBank, TrendingUp, Wallet, Umbrella, Info } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface FinancialInputs {
  monthlyIncome: number;
  monthlyExpenses: number;
  emergencyFund: number;
  totalDebt: number;
  monthlyDebtPayment: number;
  totalInvestments: number;
  monthlySavings: number;
  insuranceCoverage: number;
  retirementCorpus: number;
  age: number;
}

interface ScoreCategory {
  name: string;
  icon: React.ElementType;
  score: number;
  maxScore: number;
  color: string;
  tip: string;
}

const defaultInputs: FinancialInputs = {
  monthlyIncome: 0,
  monthlyExpenses: 0,
  emergencyFund: 0,
  totalDebt: 0,
  monthlyDebtPayment: 0,
  totalInvestments: 0,
  monthlySavings: 0,
  insuranceCoverage: 0,
  retirementCorpus: 0,
  age: 30,
};

function calculateScores(inputs: FinancialInputs): ScoreCategory[] {
  const { monthlyIncome, monthlyExpenses, emergencyFund, totalDebt, monthlyDebtPayment, totalInvestments, monthlySavings, insuranceCoverage, retirementCorpus, age } = inputs;

  if (monthlyIncome <= 0) return [];

  // 1. Emergency Fund Score (0-20)
  const monthsCovered = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0;
  const emergencyScore = Math.min(20, Math.round((monthsCovered / 6) * 20));

  // 2. Debt Health Score (0-20)
  const dti = monthlyIncome > 0 ? (monthlyDebtPayment / monthlyIncome) * 100 : 0;
  let debtScore = 20;
  if (dti > 50) debtScore = 0;
  else if (dti > 40) debtScore = 5;
  else if (dti > 30) debtScore = 10;
  else if (dti > 20) debtScore = 15;

  // 3. Savings Rate Score (0-20)
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
  let savingsScore = 0;
  if (savingsRate >= 30) savingsScore = 20;
  else if (savingsRate >= 20) savingsScore = 15;
  else if (savingsRate >= 10) savingsScore = 10;
  else if (savingsRate >= 5) savingsScore = 5;

  // 4. Insurance Score (0-15)
  const annualIncome = monthlyIncome * 12;
  const coverageMultiple = annualIncome > 0 ? insuranceCoverage / annualIncome : 0;
  let insuranceScore = 0;
  if (coverageMultiple >= 10) insuranceScore = 15;
  else if (coverageMultiple >= 7) insuranceScore = 12;
  else if (coverageMultiple >= 5) insuranceScore = 9;
  else if (coverageMultiple >= 3) insuranceScore = 5;

  // 5. Investment Score (0-15)
  const investmentToIncome = annualIncome > 0 ? totalInvestments / annualIncome : 0;
  const expectedMultiple = Math.max(1, (age - 25) * 0.5);
  const investmentRatio = expectedMultiple > 0 ? investmentToIncome / expectedMultiple : 0;
  const investmentScore = Math.min(15, Math.round(investmentRatio * 15));

  // 6. Retirement Readiness (0-10)
  const yearsToRetirement = Math.max(1, 60 - age);
  const targetCorpus = annualIncome * 25;
  const retirementRatio = targetCorpus > 0 ? retirementCorpus / targetCorpus : 0;
  const retirementScore = Math.min(10, Math.round(retirementRatio * 10));

  return [
    { name: "Emergency Fund", icon: Shield, score: emergencyScore, maxScore: 20, color: "text-emerald-500", tip: `${monthsCovered.toFixed(1)} months covered (target: 6 months)` },
    { name: "Debt Health", icon: Wallet, score: debtScore, maxScore: 20, color: "text-blue-500", tip: `DTI ratio: ${dti.toFixed(1)}% (target: <20%)` },
    { name: "Savings Rate", icon: PiggyBank, score: savingsScore, maxScore: 20, color: "text-amber-500", tip: `Saving ${savingsRate.toFixed(1)}% of income (target: 20%+)` },
    { name: "Insurance", icon: Umbrella, score: insuranceScore, maxScore: 15, color: "text-purple-500", tip: `Coverage: ${coverageMultiple.toFixed(1)}x annual income (target: 10x)` },
    { name: "Investments", icon: TrendingUp, score: investmentScore, maxScore: 15, color: "text-cyan-500", tip: `${investmentToIncome.toFixed(1)}x annual income invested` },
    { name: "Retirement", icon: Heart, score: retirementScore, maxScore: 10, color: "text-rose-500", tip: `${(retirementRatio * 100).toFixed(0)}% of target corpus saved` },
  ];
}

function getGrade(score: number): { label: string; color: string; message: string } {
  if (score >= 85) return { label: "Excellent", color: "text-emerald-500", message: "Outstanding financial health! Keep it up." };
  if (score >= 70) return { label: "Good", color: "text-blue-500", message: "Strong foundation — a few areas to optimize." };
  if (score >= 50) return { label: "Fair", color: "text-amber-500", message: "Room for improvement in key areas." };
  if (score >= 30) return { label: "Needs Work", color: "text-orange-500", message: "Focus on building emergency fund and reducing debt." };
  return { label: "Critical", color: "text-red-500", message: "Immediate attention needed on financial fundamentals." };
}

const inputFields = [
  { key: "age", label: "Your Age", placeholder: "30" },
  { key: "monthlyIncome", label: "Monthly Income (₹)", placeholder: "100000" },
  { key: "monthlyExpenses", label: "Monthly Expenses (₹)", placeholder: "60000" },
  { key: "monthlySavings", label: "Monthly Savings (₹)", placeholder: "20000" },
  { key: "emergencyFund", label: "Emergency Fund (₹)", placeholder: "300000" },
  { key: "totalDebt", label: "Total Outstanding Debt (₹)", placeholder: "500000" },
  { key: "monthlyDebtPayment", label: "Monthly Debt Payments (₹)", placeholder: "15000" },
  { key: "totalInvestments", label: "Total Investments (₹)", placeholder: "1000000" },
  { key: "insuranceCoverage", label: "Life Insurance Coverage (₹)", placeholder: "10000000" },
  { key: "retirementCorpus", label: "Retirement Corpus (₹)", placeholder: "2000000" },
];

const FinancialHealthScore = () => {
  const goBack = useGoBack();
  const [inputs, setInputs] = useState<FinancialInputs>(() => {
    const saved: Partial<FinancialInputs> = {};
    for (const key of Object.keys(defaultInputs) as (keyof FinancialInputs)[]) {
      const v = parseFloat(localStorage.getItem(`fhs_${key}`) || "0");
      if (!isNaN(v) && v > 0) saved[key] = v;
    }
    // Auto-populate monthlyIncome from salary_total if not already saved in FHS
    if (!saved.monthlyIncome) {
      const salaryTotal = parseFloat(localStorage.getItem("salary_total") || "0");
      if (salaryTotal > 0) saved.monthlyIncome = Math.round(salaryTotal / 12);
    }
    return { ...defaultInputs, ...saved };
  });
  const [calculated, setCalculated] = useState(false);

  const scores = useMemo(() => calculateScores(inputs), [inputs]);
  const totalScore = scores.reduce((sum, c) => sum + c.score, 0);
  const grade = getGrade(totalScore);

  const handleChange = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: Number(value) || 0 }));
  };

  // Persist inputs to localStorage for Smart Action Plan
  useEffect(() => {
    Object.entries(inputs).forEach(([key, value]) => {
      localStorage.setItem(`fhs_${key}`, String(value));
    });
  }, [inputs]);

  const handleCalculate = () => setCalculated(true);
  const handleReset = () => { setInputs(defaultInputs); setCalculated(false); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              Financial Health Score
            </h1>
            <p className="text-sm text-muted-foreground">Get a comprehensive score across 6 financial dimensions</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Input Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Your Financial Snapshot</CardTitle>
              <CardDescription>Enter your current numbers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {inputFields.map((field) => (
                <div key={field.key} className="space-y-1">
                  <Label className="text-xs">{field.label}</Label>
                  <Input
                    type="number"
                    placeholder={field.placeholder}
                    value={inputs[field.key as keyof FinancialInputs] || ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" onClick={handleCalculate}>Calculate Score</Button>
                <Button variant="outline" onClick={handleReset}>Reset</Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <div className="lg:col-span-3 space-y-6">
            {calculated && scores.length > 0 ? (
              <>
                {/* Overall Score */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6 text-center">
                      <div className="relative inline-flex items-center justify-center mb-4">
                        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                          <circle
                            cx="60" cy="60" r="52" fill="none"
                            stroke="hsl(var(--primary))" strokeWidth="8"
                            strokeDasharray={`${(totalScore / 100) * 327} 327`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-4xl font-bold">{totalScore}</span>
                          <span className="text-xs text-muted-foreground">/100</span>
                        </div>
                      </div>
                      <p className={`text-2xl font-bold ${grade.color}`}>{grade.label}</p>
                      <p className="text-sm text-muted-foreground mt-1">{grade.message}</p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Category Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {scores.map((cat, i) => {
                    const Icon = cat.icon;
                    const pct = (cat.score / cat.maxScore) * 100;
                    return (
                      <motion.div
                        key={cat.name}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <Card>
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Icon className={`h-4 w-4 ${cat.color}`} />
                                <span className="text-sm font-medium">{cat.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-bold">{cat.score}/{cat.maxScore}</span>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent><p className="text-xs max-w-48">{cat.tip}</p></TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                            <Progress value={pct} className="h-2" />
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            ) : (
              <Card className="border-dashed border-2">
                <CardContent className="pt-6 text-center py-20">
                  <Heart className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">Enter your financial details and click "Calculate Score"</p>
                  <p className="text-xs text-muted-foreground mt-1">Your data stays in your browser — nothing is sent anywhere</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FinancialHealthScore;
