import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Wand2, TrendingUp, IndianRupee, Lightbulb, ArrowRight, CheckCircle2, Info, Sparkles } from "lucide-react";

interface DeductionSuggestion {
  id: string;
  section: string;
  name: string;
  suggestedAmount: number;
  maxLimit: number;
  taxSaved: number;
  expectedReturn: string;
  lockIn: string;
  priority: number;
  reason: string;
  currentClaimed: number;
}

interface SmartDeductionOptimizerProps {
  grossSalary: number;
  currentDeductions: Record<string, number>;
  taxableIncome: number;
  hraExemption: number;
  isEligibleForHRA: boolean;
  rentPaid: number;
  hasHomeLoan: boolean;
  onApplySuggestion?: (deductionId: string, amount: number) => void;
}

const SmartDeductionOptimizer = ({
  grossSalary,
  currentDeductions,
  taxableIncome,
  hraExemption,
  isEligibleForHRA,
  rentPaid,
  hasHomeLoan,
  onApplySuggestion
}: SmartDeductionOptimizerProps) => {
  const [investmentBudget, setInvestmentBudget] = useState(0);
  const [showOptimizedPlan, setShowOptimizedPlan] = useState(false);
  const [excludeExistingInvestments, setExcludeExistingInvestments] = useState(true);

  // Determine tax bracket based on taxable income
  const taxBracket = useMemo(() => {
    if (taxableIncome > 1000000) return 0.30;
    if (taxableIncome > 500000) return 0.20;
    if (taxableIncome > 250000) return 0.05;
    return 0;
  }, [taxableIncome]);

  const marginalRate = useMemo(() => {
    if (taxableIncome > 1000000) return 0.312; // 30% + 4% cess
    if (taxableIncome > 500000) return 0.208; // 20% + 4% cess
    if (taxableIncome > 250000) return 0.052; // 5% + 4% cess
    return 0;
  }, [taxableIncome]);

  const suggestions = useMemo((): DeductionSuggestion[] => {
    const allSuggestions: DeductionSuggestion[] = [];
    
    const current80C = currentDeductions["80c"] || 0;
    const current80D = currentDeductions["80d"] || 0;
    const currentNPS = currentDeductions["80ccd1b"] || 0;
    const current24b = currentDeductions["24b"] || 0;
    const current80E = currentDeductions["80e"] || 0;
    const current80G = currentDeductions["80g"] || 0;

    // 80C - Highest priority as it covers multiple options
    if (current80C < 150000) {
      const gap = 150000 - current80C;
      allSuggestions.push({
        id: "80c",
        section: "80C",
        name: "PPF/ELSS/EPF/LIC/NSC",
        suggestedAmount: gap,
        maxLimit: 150000,
        taxSaved: Math.round(gap * marginalRate),
        expectedReturn: "7-12% (ELSS: 12%, PPF: 7.1%)",
        lockIn: "3-15 years",
        priority: 1,
        reason: "Mandatory first step - Diversify across ELSS (high return), PPF (safe), and EPF (employer match)",
        currentClaimed: current80C
      });
    }

    // 80CCD(1B) - NPS Additional
    if (currentNPS < 50000) {
      const gap = 50000 - currentNPS;
      allSuggestions.push({
        id: "80ccd1b",
        section: "80CCD(1B)",
        name: "NPS Additional Contribution",
        suggestedAmount: gap,
        maxLimit: 50000,
        taxSaved: Math.round(gap * marginalRate),
        expectedReturn: "8-10%",
        lockIn: "Till 60 years",
        priority: 2,
        reason: "Extra ₹50,000 over 80C limit - Market-linked with partial equity exposure",
        currentClaimed: currentNPS
      });
    }

    // 80D - Health Insurance
    if (current80D < 75000) {
      const selfLimit = 25000;
      const parentsLimit = 50000;
      const totalLimit = selfLimit + parentsLimit;
      const gap = Math.min(totalLimit - current80D, 75000);
      
      if (gap > 0) {
        allSuggestions.push({
          id: "80d",
          section: "80D",
          name: "Health Insurance Premium",
          suggestedAmount: gap,
          maxLimit: 100000,
          taxSaved: Math.round(gap * marginalRate),
          expectedReturn: "N/A (Insurance)",
          lockIn: "Annual renewal",
          priority: 3,
          reason: "Essential coverage - ₹25K for self/family, ₹50K for senior citizen parents",
          currentClaimed: current80D
        });
      }
    }

    // 24(b) - Home Loan Interest (if applicable)
    if (hasHomeLoan && current24b < 200000) {
      const gap = 200000 - current24b;
      allSuggestions.push({
        id: "24b",
        section: "24(b)",
        name: "Home Loan Interest",
        suggestedAmount: gap,
        maxLimit: 200000,
        taxSaved: Math.round(gap * marginalRate),
        expectedReturn: "N/A (Expense)",
        lockIn: "Loan tenure",
        priority: 4,
        reason: "If paying home loan EMI, claim full interest component up to ₹2L",
        currentClaimed: current24b
      });
    }

    // 80GG - Rent without HRA
    if (!isEligibleForHRA && rentPaid > 0) {
      const limit80GG = Math.min(60000, rentPaid * 12 - taxableIncome * 0.1, taxableIncome * 0.25);
      if (limit80GG > 0 && !currentDeductions["80gg"]) {
        allSuggestions.push({
          id: "80gg",
          section: "80GG",
          name: "Rent Paid (Without HRA)",
          suggestedAmount: Math.round(limit80GG),
          maxLimit: 60000,
          taxSaved: Math.round(limit80GG * marginalRate),
          expectedReturn: "N/A (Expense)",
          lockIn: "N/A",
          priority: 5,
          reason: "If not receiving HRA but paying rent, claim up to ₹5,000/month",
          currentClaimed: 0
        });
      }
    }

    // 80E - Education Loan
    if (current80E === 0) {
      allSuggestions.push({
        id: "80e",
        section: "80E",
        name: "Education Loan Interest",
        suggestedAmount: 0,
        maxLimit: Infinity,
        taxSaved: 0,
        expectedReturn: "N/A",
        lockIn: "8 years max",
        priority: 6,
        reason: "If you have education loan, entire interest is deductible with no upper limit",
        currentClaimed: 0
      });
    }

    // 80G - Donations
    if (current80G === 0 && grossSalary > 500000) {
      const suggestedDonation = Math.round(grossSalary * 0.02);
      allSuggestions.push({
        id: "80g",
        section: "80G",
        name: "Donations to Charity",
        suggestedAmount: suggestedDonation,
        maxLimit: Math.round(grossSalary * 0.1),
        taxSaved: Math.round(suggestedDonation * marginalRate),
        expectedReturn: "N/A (Philanthropy)",
        lockIn: "N/A",
        priority: 7,
        reason: "100% deduction for PM CARES/PMNRF, 50% for other approved charities",
        currentClaimed: 0
      });
    }

    // Sort by priority
    return allSuggestions.sort((a, b) => a.priority - b.priority);
  }, [currentDeductions, marginalRate, hasHomeLoan, isEligibleForHRA, rentPaid, taxableIncome, grossSalary]);

  // Calculate optimized allocation based on budget
  const optimizedPlan = useMemo(() => {
    if (investmentBudget <= 0) return [];

    let remainingBudget = investmentBudget;
    const allocations: Array<{ suggestion: DeductionSuggestion; allocated: number }> = [];

    // Allocate in priority order
    for (const suggestion of suggestions) {
      if (remainingBudget <= 0) break;
      if (suggestion.suggestedAmount <= 0) continue;

      const adjustedAmount = excludeExistingInvestments 
        ? suggestion.suggestedAmount 
        : Math.max(0, suggestion.maxLimit - suggestion.currentClaimed);

      const toAllocate = Math.min(remainingBudget, adjustedAmount);
      
      if (toAllocate > 0) {
        allocations.push({
          suggestion,
          allocated: toAllocate
        });
        remainingBudget -= toAllocate;
      }
    }

    return allocations;
  }, [investmentBudget, suggestions, excludeExistingInvestments]);

  const totalTaxSaved = useMemo(() => {
    return optimizedPlan.reduce((sum, item) => sum + Math.round(item.allocated * marginalRate), 0);
  }, [optimizedPlan, marginalRate]);

  const formatCurrency = (value: number): string => {
    if (value === 0) return "₹0";
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const handleOptimize = () => {
    if (investmentBudget > 0) {
      setShowOptimizedPlan(true);
    }
  };

  return (
    <Card className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <Wand2 className="w-5 h-5" />
          Smart Deduction Optimizer
          <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 ml-2">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        </CardTitle>
        <CardDescription>
          Enter your available investment budget and get personalized tax-saving recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Input */}
        <div className="p-4 bg-background rounded-lg border-2 border-amber-200 dark:border-amber-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4" />
                Available Investment Budget (Annual)
              </Label>
              <Input
                type="number"
                placeholder="Enter amount you can invest this year"
                value={investmentBudget || ''}
                onChange={(e) => {
                  setInvestmentBudget(parseFloat(e.target.value) || 0);
                  setShowOptimizedPlan(false);
                }}
                className="text-lg font-semibold"
              />
            </div>
            <Button 
              onClick={handleOptimize}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white h-10"
              disabled={investmentBudget <= 0}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Optimal Plan
            </Button>
          </div>
          
          <div className="flex items-center gap-3 mt-4">
            <Switch 
              checked={excludeExistingInvestments} 
              onCheckedChange={setExcludeExistingInvestments}
            />
            <Label className="text-sm text-muted-foreground">
              Exclude already claimed deductions from recommendations
            </Label>
          </div>
        </div>

        {/* Current Status */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Your Current Tax Status</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{formatCurrency(grossSalary)}</div>
              <div className="text-xs text-muted-foreground">Gross Salary</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{formatCurrency(taxableIncome)}</div>
              <div className="text-xs text-muted-foreground">Taxable Income</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{(marginalRate * 100).toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Marginal Tax Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(hraExemption)}</div>
              <div className="text-xs text-muted-foreground">HRA Exemption</div>
            </div>
          </div>
        </div>

        {/* Suggestions List */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Available Deduction Opportunities
          </h4>
          
          {suggestions.filter(s => s.suggestedAmount > 0).map((suggestion, index) => (
            <div 
              key={suggestion.id}
              className="p-4 border rounded-lg bg-background hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="font-mono">{suggestion.section}</Badge>
                    <span className="font-medium">{suggestion.name}</span>
                    <Badge 
                      className={`text-xs ${index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-gray-500'} text-white border-0`}
                    >
                      Priority {suggestion.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{suggestion.reason}</p>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <span>Return: <strong>{suggestion.expectedReturn}</strong></span>
                    <span>Lock-in: <strong>{suggestion.lockIn}</strong></span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-amber-600">
                    {formatCurrency(suggestion.suggestedAmount)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Gap to max
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    Save {formatCurrency(suggestion.taxSaved)}
                  </div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Claimed: {formatCurrency(suggestion.currentClaimed)}</span>
                  <span>Limit: {suggestion.maxLimit === Infinity ? 'No Limit' : formatCurrency(suggestion.maxLimit)}</span>
                </div>
                <Progress 
                  value={suggestion.maxLimit === Infinity ? 0 : (suggestion.currentClaimed / suggestion.maxLimit) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Optimized Plan */}
        {showOptimizedPlan && optimizedPlan.length > 0 && (
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border-2 border-green-300 dark:border-green-700">
            <h4 className="font-semibold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Your Optimized Investment Plan
            </h4>
            
            <div className="space-y-3">
              {optimizedPlan.map((item, index) => (
                <div key={item.suggestion.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{item.suggestion.section}</Badge>
                        <span className="font-medium">{item.suggestion.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.suggestion.expectedReturn} | {item.suggestion.lockIn}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-700 dark:text-green-400">
                      {formatCurrency(item.allocated)}
                    </div>
                    <div className="text-xs text-green-600">
                      Save: {formatCurrency(Math.round(item.allocated * marginalRate))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-green-300 dark:border-green-700 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {formatCurrency(investmentBudget)}
                </div>
                <div className="text-xs text-muted-foreground">Total Investment</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {formatCurrency(totalTaxSaved)}
                </div>
                <div className="text-xs text-muted-foreground">Tax Saved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {investmentBudget > 0 ? ((totalTaxSaved / investmentBudget) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-xs text-muted-foreground">Effective Savings</div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                <Lightbulb className="w-4 h-4 inline mr-1" />
                <strong>Pro Tip:</strong> Spread investments across the year to benefit from rupee cost averaging. 
                Start SIPs in ELSS for 80C and ensure health insurance renewal before March.
              </p>
            </div>
          </div>
        )}

        {showOptimizedPlan && optimizedPlan.length === 0 && investmentBudget > 0 && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <CheckCircle2 className="w-4 h-4 inline mr-1" />
              Great news! You've already maximized all available deductions. Consider investing the 
              budget in market-linked instruments for wealth creation.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartDeductionOptimizer;
