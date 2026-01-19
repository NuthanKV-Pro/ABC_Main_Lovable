import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, PiggyBank, TrendingUp, AlertTriangle, CheckCircle, Target, Lightbulb, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  type: 'need' | 'want' | 'saving';
}

const defaultCategories: BudgetCategory[] = [
  { id: '1', name: 'Housing (Rent/EMI)', budgeted: 0, spent: 0, type: 'need' },
  { id: '2', name: 'Utilities', budgeted: 0, spent: 0, type: 'need' },
  { id: '3', name: 'Groceries', budgeted: 0, spent: 0, type: 'need' },
  { id: '4', name: 'Transportation', budgeted: 0, spent: 0, type: 'need' },
  { id: '5', name: 'Insurance', budgeted: 0, spent: 0, type: 'need' },
  { id: '6', name: 'Healthcare', budgeted: 0, spent: 0, type: 'need' },
  { id: '7', name: 'Entertainment', budgeted: 0, spent: 0, type: 'want' },
  { id: '8', name: 'Dining Out', budgeted: 0, spent: 0, type: 'want' },
  { id: '9', name: 'Shopping', budgeted: 0, spent: 0, type: 'want' },
  { id: '10', name: 'Emergency Fund', budgeted: 0, spent: 0, type: 'saving' },
  { id: '11', name: 'Investments', budgeted: 0, spent: 0, type: 'saving' },
];

const BudgetPlanner = () => {
  const navigate = useNavigate();
  const [monthlyIncome, setMonthlyIncome] = useState<number>(100000);
  const [categories, setCategories] = useState<BudgetCategory[]>(defaultCategories);
  const [newCategory, setNewCategory] = useState({ name: '', type: 'need' as 'need' | 'want' | 'saving' });

  const addCategory = () => {
    if (newCategory.name.trim()) {
      setCategories([
        ...categories,
        {
          id: Date.now().toString(),
          name: newCategory.name,
          budgeted: 0,
          spent: 0,
          type: newCategory.type
        }
      ]);
      setNewCategory({ name: '', type: 'need' });
    }
  };

  const removeCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const updateCategory = (id: string, field: 'budgeted' | 'spent', value: number) => {
    setCategories(categories.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const totalBudgeted = categories.reduce((sum, c) => sum + c.budgeted, 0);
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
  const unallocated = monthlyIncome - totalBudgeted;
  const remaining = totalBudgeted - totalSpent;

  const needsTotal = categories.filter(c => c.type === 'need').reduce((sum, c) => sum + c.budgeted, 0);
  const wantsTotal = categories.filter(c => c.type === 'want').reduce((sum, c) => sum + c.budgeted, 0);
  const savingsTotal = categories.filter(c => c.type === 'saving').reduce((sum, c) => sum + c.budgeted, 0);

  const needsPercent = monthlyIncome > 0 ? (needsTotal / monthlyIncome) * 100 : 0;
  const wantsPercent = monthlyIncome > 0 ? (wantsTotal / monthlyIncome) * 100 : 0;
  const savingsPercent = monthlyIncome > 0 ? (savingsTotal / monthlyIncome) * 100 : 0;

  const getBudgetHealth = () => {
    if (savingsPercent >= 20 && needsPercent <= 50) return { status: 'Excellent', color: 'text-green-500', icon: CheckCircle };
    if (savingsPercent >= 15 && needsPercent <= 60) return { status: 'Good', color: 'text-blue-500', icon: TrendingUp };
    if (savingsPercent >= 10) return { status: 'Fair', color: 'text-amber-500', icon: AlertTriangle };
    return { status: 'Needs Improvement', color: 'text-red-500', icon: AlertTriangle };
  };

  const health = getBudgetHealth();
  const HealthIcon = health.icon;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
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
              <h1 className="text-2xl font-bold text-primary">Budget Planner</h1>
              <p className="text-sm text-muted-foreground">Create & track monthly budgets</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Income Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-primary" />
                Monthly Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Label htmlFor="income" className="min-w-[120px]">Net Monthly Income</Label>
                <Input
                  id="income"
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  className="max-w-[200px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Budget Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Budgeted</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(totalBudgeted)}</p>
                  <p className="text-xs text-muted-foreground">{((totalBudgeted / monthlyIncome) * 100).toFixed(1)}% of income</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold text-destructive">{formatCurrency(totalSpent)}</p>
                  <p className="text-xs text-muted-foreground">{((totalSpent / totalBudgeted) * 100 || 0).toFixed(1)}% of budget</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Remaining Budget</p>
                  <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(remaining)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Unallocated</p>
                  <p className={`text-2xl font-bold ${unallocated >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                    {formatCurrency(unallocated)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 50/30/20 Rule Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                50/30/20 Rule Analysis
              </CardTitle>
              <CardDescription>
                Compare your budget against the recommended 50% Needs, 30% Wants, 20% Savings rule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-blue-500">Needs</span>
                    <span className={needsPercent <= 50 ? 'text-green-500' : 'text-red-500'}>
                      {needsPercent.toFixed(1)}% (Target: ≤50%)
                    </span>
                  </div>
                  <Progress value={Math.min(needsPercent, 100)} className="h-3" />
                  <p className="text-sm text-muted-foreground">{formatCurrency(needsTotal)}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-purple-500">Wants</span>
                    <span className={wantsPercent <= 30 ? 'text-green-500' : 'text-red-500'}>
                      {wantsPercent.toFixed(1)}% (Target: ≤30%)
                    </span>
                  </div>
                  <Progress value={Math.min(wantsPercent, 100)} className="h-3" />
                  <p className="text-sm text-muted-foreground">{formatCurrency(wantsTotal)}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-green-500">Savings</span>
                    <span className={savingsPercent >= 20 ? 'text-green-500' : 'text-amber-500'}>
                      {savingsPercent.toFixed(1)}% (Target: ≥20%)
                    </span>
                  </div>
                  <Progress value={Math.min(savingsPercent, 100)} className="h-3" />
                  <p className="text-sm text-muted-foreground">{formatCurrency(savingsTotal)}</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 p-4 rounded-lg bg-muted/50`}>
                <HealthIcon className={`h-5 w-5 ${health.color}`} />
                <span className={`font-medium ${health.color}`}>Budget Health: {health.status}</span>
              </div>
            </CardContent>
          </Card>

          {/* Budget Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Categories</CardTitle>
              <CardDescription>Set budget limits and track spending for each category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Category */}
              <div className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-lg">
                <Input
                  placeholder="Category name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="max-w-[200px]"
                />
                <Select
                  value={newCategory.type}
                  onValueChange={(value: 'need' | 'want' | 'saving') => setNewCategory({ ...newCategory, type: value })}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="need">Need</SelectItem>
                    <SelectItem value="want">Want</SelectItem>
                    <SelectItem value="saving">Saving</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addCategory} size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>

              {/* Category List */}
              <div className="space-y-3">
                {['need', 'want', 'saving'].map((type) => (
                  <div key={type} className="space-y-2">
                    <h4 className="font-semibold capitalize text-sm text-muted-foreground">
                      {type === 'need' ? '🏠 Needs' : type === 'want' ? '🎯 Wants' : '💰 Savings'}
                    </h4>
                    {categories.filter(c => c.type === type).map((category) => {
                      const percentSpent = category.budgeted > 0 ? (category.spent / category.budgeted) * 100 : 0;
                      return (
                        <div key={category.id} className="flex flex-wrap items-center gap-3 p-3 bg-card rounded-lg border">
                          <span className="font-medium min-w-[150px] flex-1">{category.name}</span>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground">Budget:</Label>
                            <Input
                              type="number"
                              value={category.budgeted}
                              onChange={(e) => updateCategory(category.id, 'budgeted', Number(e.target.value))}
                              className="w-[100px]"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground">Spent:</Label>
                            <Input
                              type="number"
                              value={category.spent}
                              onChange={(e) => updateCategory(category.id, 'spent', Number(e.target.value))}
                              className="w-[100px]"
                            />
                          </div>
                          <div className="w-[100px]">
                            <Progress 
                              value={Math.min(percentSpent, 100)} 
                              className={`h-2 ${percentSpent > 100 ? '[&>div]:bg-red-500' : percentSpent > 80 ? '[&>div]:bg-amber-500' : ''}`}
                            />
                            <span className={`text-xs ${percentSpent > 100 ? 'text-red-500' : ''}`}>
                              {percentSpent.toFixed(0)}%
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCategory(category.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips & Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Budgeting Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <li className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Pay yourself first - allocate savings before spending</span>
                </li>
                <li className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Track every expense to identify spending patterns</span>
                </li>
                <li className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Review and adjust your budget monthly</span>
                </li>
                <li className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Build an emergency fund of 3-6 months expenses</span>
                </li>
                <li className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Use envelope budgeting for variable expenses</span>
                </li>
                <li className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Automate recurring savings and bill payments</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <Info className="h-5 w-5" />
                Important Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                This Budget Planner is provided for informational and educational purposes only. It is not intended
                to provide financial, investment, or tax advice.
              </p>
              <p>
                The 50/30/20 rule is a general guideline and may not be suitable for everyone. Individual circumstances,
                income levels, cost of living, and financial goals vary significantly.
              </p>
              <p>
                Data entered in this tool is stored locally in your browser and is not saved to any server.
                We recommend maintaining your own records separately.
              </p>
              <p>
                For personalized financial planning, please consult a certified financial planner or advisor.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BudgetPlanner;
