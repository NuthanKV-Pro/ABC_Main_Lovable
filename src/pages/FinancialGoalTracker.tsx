import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target, Plus, Trash2, TrendingUp, Calendar, Lightbulb, AlertTriangle, CheckCircle, Clock, PiggyBank, Car, GraduationCap, Plane, Home, Heart, Sparkles, IndianRupee } from "lucide-react";

interface FinancialGoal {
  id: string;
  name: string;
  category: string;
  targetAmount: number;
  currentSavings: number;
  monthlyContribution: number;
  targetDate: string;
  priority: "high" | "medium" | "low";
}

const goalCategories = [
  { value: "car", label: "Car Purchase", icon: Car },
  { value: "vacation", label: "Vacation/Travel", icon: Plane },
  { value: "education", label: "Education", icon: GraduationCap },
  { value: "home", label: "Home Down Payment", icon: Home },
  { value: "wedding", label: "Wedding", icon: Heart },
  { value: "emergency", label: "Emergency Fund", icon: PiggyBank },
  { value: "retirement", label: "Retirement", icon: TrendingUp },
  { value: "other", label: "Other", icon: Target },
];

const FinancialGoalTracker = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<FinancialGoal[]>([
    {
      id: "1",
      name: "New Car",
      category: "car",
      targetAmount: 800000,
      currentSavings: 250000,
      monthlyContribution: 15000,
      targetDate: "2026-06-01",
      priority: "high",
    },
    {
      id: "2",
      name: "Europe Trip",
      category: "vacation",
      targetAmount: 300000,
      currentSavings: 75000,
      monthlyContribution: 10000,
      targetDate: "2025-12-01",
      priority: "medium",
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<FinancialGoal>>({
    name: "",
    category: "other",
    targetAmount: 0,
    currentSavings: 0,
    monthlyContribution: 0,
    targetDate: "",
    priority: "medium",
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const calculateMonthsToGoal = (goal: FinancialGoal) => {
    const remaining = goal.targetAmount - goal.currentSavings;
    if (goal.monthlyContribution <= 0) return Infinity;
    return Math.ceil(remaining / goal.monthlyContribution);
  };

  const getExpectedCompletionDate = (goal: FinancialGoal) => {
    const months = calculateMonthsToGoal(goal);
    if (months === Infinity) return "Never (no contribution)";
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  };

  const isOnTrack = (goal: FinancialGoal) => {
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    const monthsRemaining = (targetDate.getFullYear() - today.getFullYear()) * 12 + (targetDate.getMonth() - today.getMonth());
    const monthsNeeded = calculateMonthsToGoal(goal);
    return monthsNeeded <= monthsRemaining;
  };

  const addGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.targetDate) return;
    
    const goal: FinancialGoal = {
      id: Date.now().toString(),
      name: newGoal.name!,
      category: newGoal.category || "other",
      targetAmount: newGoal.targetAmount!,
      currentSavings: newGoal.currentSavings || 0,
      monthlyContribution: newGoal.monthlyContribution || 0,
      targetDate: newGoal.targetDate!,
      priority: newGoal.priority as "high" | "medium" | "low",
    };
    
    setGoals([...goals, goal]);
    setNewGoal({
      name: "",
      category: "other",
      targetAmount: 0,
      currentSavings: 0,
      monthlyContribution: 0,
      targetDate: "",
      priority: "medium",
    });
    setShowAddForm(false);
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const updateGoal = (id: string, field: keyof FinancialGoal, value: any) => {
    setGoals(goals.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const getCategoryIcon = (category: string) => {
    const cat = goalCategories.find(c => c.value === category);
    return cat?.icon || Target;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "low": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  // Summary calculations
  const totalTargetAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrentSavings = goals.reduce((sum, g) => sum + g.currentSavings, 0);
  const totalMonthlyContribution = goals.reduce((sum, g) => sum + g.monthlyContribution, 0);
  const goalsOnTrack = goals.filter(isOnTrack).length;
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentSavings / totalTargetAmount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                <Target className="h-6 w-6" />
                Financial Goal Tracker
              </h1>
              <p className="text-sm text-muted-foreground">Set, track, and achieve your financial goals</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Goals</p>
                    <p className="text-2xl font-bold">{goals.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <PiggyBank className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Saved</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalCurrentSavings)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Savings</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalMonthlyContribution)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">On Track</p>
                    <p className="text-2xl font-bold">{goalsOnTrack}/{goals.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Overall Progress
              </CardTitle>
              <CardDescription>
                {formatCurrency(totalCurrentSavings)} of {formatCurrency(totalTargetAmount)} saved
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={overallProgress} className="h-4" />
              <p className="text-sm text-muted-foreground mt-2">{overallProgress.toFixed(1)}% complete</p>
            </CardContent>
          </Card>

          {/* Add New Goal Button */}
          <div className="flex justify-end">
            <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Goal
            </Button>
          </div>

          {/* Add Goal Form */}
          {showAddForm && (
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Create New Financial Goal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Goal Name</Label>
                    <Input
                      placeholder="e.g., Dream Car"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={newGoal.category} onValueChange={(v) => setNewGoal({ ...newGoal, category: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {goalCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={newGoal.priority} onValueChange={(v) => setNewGoal({ ...newGoal, priority: v as any })}>
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
                  <div className="space-y-2">
                    <Label>Target Amount (₹)</Label>
                    <Input
                      type="number"
                      placeholder="500000"
                      value={newGoal.targetAmount || ""}
                      onChange={(e) => setNewGoal({ ...newGoal, targetAmount: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Savings (₹)</Label>
                    <Input
                      type="number"
                      placeholder="100000"
                      value={newGoal.currentSavings || ""}
                      onChange={(e) => setNewGoal({ ...newGoal, currentSavings: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Contribution (₹)</Label>
                    <Input
                      type="number"
                      placeholder="10000"
                      value={newGoal.monthlyContribution || ""}
                      onChange={(e) => setNewGoal({ ...newGoal, monthlyContribution: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Target Date</Label>
                    <Input
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                  <Button onClick={addGoal}>Add Goal</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Goals List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Goals</h2>
            {goals.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No goals yet. Add your first financial goal to get started!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {goals.map((goal) => {
                  const Icon = getCategoryIcon(goal.category);
                  const progress = calculateProgress(goal.currentSavings, goal.targetAmount);
                  const onTrack = isOnTrack(goal);
                  const monthsToGoal = calculateMonthsToGoal(goal);
                  const remaining = goal.targetAmount - goal.currentSavings;

                  return (
                    <Card key={goal.id} className="relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-1 h-full ${onTrack ? 'bg-green-500' : 'bg-amber-500'}`} />
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{goal.name}</CardTitle>
                              <CardDescription>{goalCategories.find(c => c.value === goal.category)?.label}</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(goal.priority)}>
                              {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
                            </Badge>
                            <Button variant="ghost" size="icon" onClick={() => removeGoal(goal.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{formatCurrency(goal.currentSavings)}</span>
                            <span className="text-muted-foreground">{formatCurrency(goal.targetAmount)}</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">{progress.toFixed(1)}% complete</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <IndianRupee className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Remaining</p>
                              <p className="font-medium">{formatCurrency(remaining)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Monthly</p>
                              <p className="font-medium">{formatCurrency(goal.monthlyContribution)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Target</p>
                              <p className="font-medium">{new Date(goal.targetDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">ETA</p>
                              <p className="font-medium">{getExpectedCompletionDate(goal)}</p>
                            </div>
                          </div>
                        </div>

                        <div className={`flex items-center gap-2 p-2 rounded-lg ${onTrack ? 'bg-green-500/10' : 'bg-amber-500/10'}`}>
                          {onTrack ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-500">On track to meet your goal!</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                              <span className="text-sm text-amber-500">
                                Need {formatCurrency(remaining / Math.max(1, monthsToGoal - (monthsToGoal - calculateMonthsToGoal(goal))))}/month to stay on track
                              </span>
                            </>
                          )}
                        </div>

                        {/* Update savings */}
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="Add savings"
                            className="flex-1"
                            id={`savings-${goal.id}`}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const input = document.getElementById(`savings-${goal.id}`) as HTMLInputElement;
                              const value = Number(input.value);
                              if (value > 0) {
                                updateGoal(goal.id, "currentSavings", goal.currentSavings + value);
                                input.value = "";
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tips and Strategies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  Goal Setting Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>SMART Goals:</strong> Make goals Specific, Measurable, Achievable, Relevant, and Time-bound</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Prioritize:</strong> Focus on high-priority goals first, especially those with deadlines</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Automate:</strong> Set up automatic transfers to goal-specific accounts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Review Monthly:</strong> Track progress and adjust contributions as needed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Celebrate Milestones:</strong> Acknowledge progress at 25%, 50%, and 75% marks</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Saving Strategies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span><strong>50/30/20 Rule:</strong> Allocate 50% to needs, 30% to wants, 20% to savings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span><strong>Pay Yourself First:</strong> Save before spending on discretionary items</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span><strong>Round-Up Savings:</strong> Round up purchases and save the difference</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span><strong>Windfalls:</strong> Direct bonuses, tax refunds, and gifts to goals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span><strong>Cut Subscriptions:</strong> Review and cancel unused subscriptions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Investment Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-primary" />
                Where to Park Your Goal Savings
              </CardTitle>
              <CardDescription>Choose investment options based on your goal timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-green-500 mb-2">Short-term (0-2 years)</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Savings Account</li>
                    <li>• Fixed Deposits</li>
                    <li>• Liquid Mutual Funds</li>
                    <li>• Recurring Deposits</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-amber-500 mb-2">Medium-term (2-5 years)</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Debt Mutual Funds</li>
                    <li>• Corporate Bonds</li>
                    <li>• Hybrid Funds</li>
                    <li>• PPF (for 5+ years)</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-blue-500 mb-2">Long-term (5+ years)</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Equity Mutual Funds</li>
                    <li>• Index Funds</li>
                    <li>• NPS</li>
                    <li>• ELSS (tax saving)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="h-5 w-5" />
                Important Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                <strong>Educational Purpose Only:</strong> This Financial Goal Tracker is designed for educational and planning purposes only. 
                It should not be considered as financial advice, investment recommendation, or professional guidance.
              </p>
              <p>
                <strong>No Guarantee of Results:</strong> The projections and estimates shown are based on the information you provide and 
                do not guarantee actual investment returns or goal achievement. Actual results may vary significantly based on market conditions, 
                inflation, personal circumstances, and other factors.
              </p>
              <p>
                <strong>Data Storage:</strong> All goal data is stored locally in your browser and is not saved to any server. 
                Clearing browser data will erase your tracked goals.
              </p>
              <p>
                <strong>Consult Professionals:</strong> Before making any financial decisions, please consult with qualified financial advisors, 
                tax consultants, or investment professionals who can provide personalized advice based on your complete financial situation.
              </p>
              <p>
                <strong>Investment Risks:</strong> All investments carry risks, including potential loss of principal. Past performance 
                does not guarantee future results. Please read all scheme-related documents carefully before investing.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FinancialGoalTracker;
