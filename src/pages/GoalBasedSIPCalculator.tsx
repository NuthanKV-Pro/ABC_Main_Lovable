import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Target, Plus, Trash2, Calendar, TrendingUp, PiggyBank, AlertTriangle, CheckCircle, Lightbulb, IndianRupee } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  targetYear: number;
  priority: 'high' | 'medium' | 'low';
  currentSavings: number;
  expectedReturn: number;
}

const GOAL_PRESETS = [
  { name: "Child's Education", amount: 2500000, years: 15 },
  { name: "Retirement Corpus", amount: 10000000, years: 25 },
  { name: "House Down Payment", amount: 1500000, years: 5 },
  { name: "Car Purchase", amount: 800000, years: 3 },
  { name: "Emergency Fund", amount: 500000, years: 2 },
  { name: "Wedding Expenses", amount: 2000000, years: 5 },
  { name: "Foreign Vacation", amount: 300000, years: 2 },
  { name: "Wealth Building", amount: 5000000, years: 10 },
];

const GoalBasedSIPCalculator = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  
  const [goals, setGoals] = useState<FinancialGoal[]>([
    { id: '1', name: "Child's Education", targetAmount: 2500000, targetYear: currentYear + 15, priority: 'high', currentSavings: 200000, expectedReturn: 12 },
    { id: '2', name: "Retirement", targetAmount: 10000000, targetYear: currentYear + 25, priority: 'high', currentSavings: 500000, expectedReturn: 12 },
    { id: '3', name: "House Down Payment", targetAmount: 1500000, targetYear: currentYear + 5, priority: 'medium', currentSavings: 300000, expectedReturn: 10 },
  ]);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const addGoal = (preset?: typeof GOAL_PRESETS[0]) => {
    const newGoal: FinancialGoal = {
      id: Date.now().toString(),
      name: preset?.name || `Goal ${goals.length + 1}`,
      targetAmount: preset?.amount || 1000000,
      targetYear: currentYear + (preset?.years || 5),
      priority: 'medium',
      currentSavings: 0,
      expectedReturn: 12
    };
    setGoals([...goals, newGoal]);
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const updateGoal = (id: string, field: keyof FinancialGoal, value: any) => {
    setGoals(goals.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  // Calculate required SIP for each goal
  const calculateSIP = (goal: FinancialGoal) => {
    const yearsRemaining = goal.targetYear - currentYear;
    const monthsRemaining = yearsRemaining * 12;
    const monthlyRate = goal.expectedReturn / 100 / 12;
    
    // Future value of current savings
    const fvCurrentSavings = goal.currentSavings * Math.pow(1 + goal.expectedReturn / 100, yearsRemaining);
    
    // Amount still needed
    const amountNeeded = Math.max(0, goal.targetAmount - fvCurrentSavings);
    
    // SIP required for the remaining amount
    // FV = P * ((1+r)^n - 1) / r * (1+r)
    // P = FV * r / ((1+r)^n - 1) / (1+r)
    let sipRequired = 0;
    if (monthsRemaining > 0 && amountNeeded > 0) {
      sipRequired = (amountNeeded * monthlyRate) / ((Math.pow(1 + monthlyRate, monthsRemaining) - 1) * (1 + monthlyRate));
    }

    // Total investment
    const totalInvestment = (sipRequired * monthsRemaining) + goal.currentSavings;
    const wealthGain = goal.targetAmount - totalInvestment;
    
    // Progress percentage
    const progressPercent = Math.min(100, (goal.currentSavings / goal.targetAmount) * 100);

    return {
      sipRequired: Math.round(sipRequired),
      monthsRemaining,
      yearsRemaining,
      fvCurrentSavings,
      amountNeeded,
      totalInvestment,
      wealthGain,
      progressPercent
    };
  };

  // Total monthly SIP required
  const totalMonthlySIP = goals.reduce((sum, goal) => sum + calculateSIP(goal).sipRequired, 0);
  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentSavings = goals.reduce((sum, goal) => sum + goal.currentSavings, 0);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/30';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Goal-Based SIP Calculator</h1>
              <p className="text-sm text-muted-foreground">Plan your investments to achieve financial goals</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Monthly SIP Needed</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalMonthlySIP)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Goals</p>
                <p className="text-2xl font-bold">{goals.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Target Corpus</p>
                <p className="text-2xl font-bold">{formatCurrency(totalTargetAmount)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Already Saved</p>
                <p className="text-2xl font-bold text-green-500">{formatCurrency(totalCurrentSavings)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Add Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Quick Add Goal Presets
              </CardTitle>
              <CardDescription>Click to add a common financial goal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {GOAL_PRESETS.map((preset, i) => (
                  <Button key={i} variant="outline" size="sm" onClick={() => addGoal(preset)}>
                    <Plus className="h-3 w-3 mr-1" /> {preset.name}
                  </Button>
                ))}
                <Button size="sm" onClick={() => addGoal()}>
                  <Plus className="h-3 w-3 mr-1" /> Custom Goal
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Goals List */}
          <div className="space-y-4">
            {goals.map((goal) => {
              const calc = calculateSIP(goal);
              return (
                <Card key={goal.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Input
                            value={goal.name}
                            onChange={(e) => updateGoal(goal.id, 'name', e.target.value)}
                            className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
                          />
                          <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(goal.priority)}`}>
                            {goal.priority} priority
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {calc.yearsRemaining} years remaining ({calc.monthsRemaining} months)
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeGoal(goal.id)} className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Target Amount (₹)</Label>
                        <Input
                          type="number"
                          value={goal.targetAmount}
                          onChange={(e) => updateGoal(goal.id, 'targetAmount', Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Target Year</Label>
                        <Input
                          type="number"
                          value={goal.targetYear}
                          onChange={(e) => updateGoal(goal.id, 'targetYear', Number(e.target.value))}
                          min={currentYear + 1}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Current Savings (₹)</Label>
                        <Input
                          type="number"
                          value={goal.currentSavings}
                          onChange={(e) => updateGoal(goal.id, 'currentSavings', Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Expected Return (%)</Label>
                        <Input
                          type="number"
                          value={goal.expectedReturn}
                          onChange={(e) => updateGoal(goal.id, 'expectedReturn', Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Priority</Label>
                        <Select value={goal.priority} onValueChange={(v) => updateGoal(goal.id, 'priority', v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress: {formatCurrency(goal.currentSavings)} of {formatCurrency(goal.targetAmount)}</span>
                        <span>{calc.progressPercent.toFixed(1)}%</span>
                      </div>
                      <Progress value={calc.progressPercent} className="h-2" />
                    </div>

                    {/* Results */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                      <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                        <p className="text-xs text-muted-foreground">Required Monthly SIP</p>
                        <p className="text-xl font-bold text-primary">{formatCurrency(calc.sipRequired)}</p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground">Amount Still Needed</p>
                        <p className="text-lg font-semibold">{formatCurrency(calc.amountNeeded)}</p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground">Total Investment</p>
                        <p className="text-lg font-semibold">{formatCurrency(calc.totalInvestment)}</p>
                      </div>
                      <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                        <p className="text-xs text-muted-foreground">Wealth Gain</p>
                        <p className="text-lg font-semibold text-green-500">{formatCurrency(calc.wealthGain)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Goal Planning Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold">Setting Realistic Goals</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Account for inflation (use 6-7% for long-term goals)</li>
                    <li>• Start with high-priority goals first</li>
                    <li>• Be conservative with return expectations (10-12% for equity)</li>
                    <li>• Review and adjust goals annually</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Investment Suggestions by Horizon</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• <strong>Short-term (1-3 years):</strong> Debt funds, FDs (6-8% returns)</li>
                    <li>• <strong>Medium-term (3-7 years):</strong> Hybrid funds (8-10% returns)</li>
                    <li>• <strong>Long-term (7+ years):</strong> Equity funds (10-12% returns)</li>
                    <li>• Diversify across asset classes for stability</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formula Explanation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>Step 1:</strong> Calculate the Future Value of your current savings at the expected return rate.</p>
              <p><strong>Step 2:</strong> Subtract this from your target amount to get the remaining amount needed.</p>
              <p><strong>Step 3:</strong> Calculate the monthly SIP required to accumulate this remaining amount.</p>
              <p className="font-mono bg-muted/30 p-2 rounded">SIP = (FV × r) ÷ [(1+r)^n - 1] × (1+r)</p>
              <p>Where FV = Future Value needed, r = monthly return rate, n = number of months</p>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                This calculator provides estimates based on assumed constant returns. Actual mutual fund returns vary and are not guaranteed.
                Past performance does not indicate future results. Consider consulting a financial advisor for personalized advice.
                Remember to account for inflation, especially for long-term goals.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default GoalBasedSIPCalculator;
