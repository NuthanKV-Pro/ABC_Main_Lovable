import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calculator, Plus, Trash2, TrendingUp, TrendingDown, DollarSign, PiggyBank, AlertTriangle, Download, BarChart3 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface CashFlowItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annually' | 'one-time';
  isRecurring: boolean;
}

const inflowCategories = [
  "Salary/Wages", "Business Income", "Rental Income", "Investment Returns", 
  "Dividends", "Interest Income", "Freelance Income", "Bonus", "Gift/Inheritance", "Other Income"
];

const outflowCategories = [
  "Housing (Rent/EMI)", "Utilities", "Groceries", "Transportation", "Insurance Premiums",
  "Healthcare", "Education", "Entertainment", "Shopping", "Dining Out", "Subscriptions",
  "Loan EMIs", "Credit Card Payments", "Investments/Savings", "Taxes", "Maintenance",
  "Personal Care", "Gifts/Donations", "Travel", "Other Expenses"
];

const CashFlowBudgetingTool = () => {
  const navigate = useNavigate();
  
  const [inflows, setInflows] = useState<CashFlowItem[]>([
    { id: "1", category: "Salary/Wages", description: "Monthly salary", amount: 80000, frequency: "monthly", isRecurring: true },
    { id: "2", category: "Rental Income", description: "Property rent", amount: 15000, frequency: "monthly", isRecurring: true },
  ]);
  
  const [outflows, setOutflows] = useState<CashFlowItem[]>([
    { id: "1", category: "Housing (Rent/EMI)", description: "Home loan EMI", amount: 25000, frequency: "monthly", isRecurring: true },
    { id: "2", category: "Groceries", description: "Monthly groceries", amount: 8000, frequency: "monthly", isRecurring: true },
    { id: "3", category: "Utilities", description: "Electricity, water, gas", amount: 3000, frequency: "monthly", isRecurring: true },
    { id: "4", category: "Transportation", description: "Fuel & maintenance", amount: 5000, frequency: "monthly", isRecurring: true },
    { id: "5", category: "Insurance Premiums", description: "Health & life insurance", amount: 15000, frequency: "quarterly", isRecurring: true },
  ]);

  const [projectionMonths, setProjectionMonths] = useState<number>(12);
  const [inflationRate, setInflationRate] = useState<number>(6);
  const [emergencyMonths, setEmergencyMonths] = useState<number>(6);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const addItem = (type: 'inflow' | 'outflow') => {
    const newItem: CashFlowItem = {
      id: Date.now().toString(),
      category: type === 'inflow' ? "Salary/Wages" : "Other Expenses",
      description: "",
      amount: 0,
      frequency: "monthly",
      isRecurring: true
    };
    if (type === 'inflow') {
      setInflows([...inflows, newItem]);
    } else {
      setOutflows([...outflows, newItem]);
    }
  };

  const removeItem = (type: 'inflow' | 'outflow', id: string) => {
    if (type === 'inflow') {
      setInflows(inflows.filter(i => i.id !== id));
    } else {
      setOutflows(outflows.filter(i => i.id !== id));
    }
  };

  const updateItem = (type: 'inflow' | 'outflow', id: string, field: keyof CashFlowItem, value: any) => {
    if (type === 'inflow') {
      setInflows(inflows.map(i => i.id === id ? { ...i, [field]: value } : i));
    } else {
      setOutflows(outflows.map(i => i.id === id ? { ...i, [field]: value } : i));
    }
  };

  // Convert to monthly amount
  const toMonthly = (amount: number, frequency: string) => {
    switch (frequency) {
      case 'quarterly': return amount / 3;
      case 'annually': return amount / 12;
      case 'one-time': return 0; // One-time not counted in recurring
      default: return amount;
    }
  };

  // Calculate totals
  const totalMonthlyInflow = inflows.reduce((sum, i) => sum + toMonthly(i.amount, i.frequency), 0);
  const totalMonthlyOutflow = outflows.reduce((sum, i) => sum + toMonthly(i.amount, i.frequency), 0);
  const monthlySurplus = totalMonthlyInflow - totalMonthlyOutflow;
  const savingsRate = totalMonthlyInflow > 0 ? (monthlySurplus / totalMonthlyInflow) * 100 : 0;

  // Category breakdown
  const outflowByCategory = outflows.reduce((acc, item) => {
    const monthly = toMonthly(item.amount, item.frequency);
    acc[item.category] = (acc[item.category] || 0) + monthly;
    return acc;
  }, {} as Record<string, number>);

  // Sort categories by amount
  const sortedCategories = Object.entries(outflowByCategory)
    .sort((a, b) => b[1] - a[1]);

  // Emergency fund required
  const emergencyFundRequired = totalMonthlyOutflow * emergencyMonths;

  // 12-month projection
  const generateProjection = () => {
    const months = [];
    for (let i = 1; i <= projectionMonths; i++) {
      const inflationMultiplier = Math.pow(1 + inflationRate / 100 / 12, i);
      const projectedInflow = totalMonthlyInflow; // Assuming income stays same
      const projectedOutflow = totalMonthlyOutflow * inflationMultiplier;
      const surplus = projectedInflow - projectedOutflow;
      months.push({
        month: i,
        inflow: projectedInflow,
        outflow: projectedOutflow,
        surplus,
        cumulativeSavings: surplus * i
      });
    }
    return months;
  };

  const projection = generateProjection();

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Cash Flow Budgeting Tool</h1>
              <p className="text-sm text-muted-foreground">Track income, expenses & plan your cash flow</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-green-500/30 bg-green-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Monthly Inflow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-500">{formatCurrency(totalMonthlyInflow)}</p>
              </CardContent>
            </Card>

            <Card className="border-red-500/30 bg-red-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  Monthly Outflow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-500">{formatCurrency(totalMonthlyOutflow)}</p>
              </CardContent>
            </Card>

            <Card className={`border-2 ${monthlySurplus >= 0 ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Monthly Surplus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${monthlySurplus >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(monthlySurplus)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <PiggyBank className="h-4 w-4 text-primary" />
                  Savings Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${savingsRate >= 20 ? 'text-green-500' : savingsRate >= 10 ? 'text-amber-500' : 'text-red-500'}`}>
                  {savingsRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="inflows" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="inflows">Inflows</TabsTrigger>
              <TabsTrigger value="outflows">Outflows</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="projection">Projection</TabsTrigger>
            </TabsList>

            {/* Inflows Tab */}
            <TabsContent value="inflows" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Income Sources
                    </CardTitle>
                    <Button onClick={() => addItem('inflow')} size="sm">
                      <Plus className="h-4 w-4 mr-1" /> Add Income
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {inflows.map((item) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 border rounded-lg items-end">
                      <div className="space-y-1">
                        <Label className="text-xs">Category</Label>
                        <Select value={item.category} onValueChange={(v) => updateItem('inflow', item.id, 'category', v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {inflowCategories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem('inflow', item.id, 'description', e.target.value)}
                          placeholder="Details..."
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Amount (₹)</Label>
                        <Input
                          type="number"
                          value={item.amount}
                          onChange={(e) => updateItem('inflow', item.id, 'amount', Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Frequency</Label>
                        <Select value={item.frequency} onValueChange={(v) => updateItem('inflow', item.id, 'frequency', v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="annually">Annually</SelectItem>
                            <SelectItem value="one-time">One-time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Monthly Equiv.</Label>
                        <p className="text-sm font-semibold text-green-500 p-2">
                          {formatCurrency(toMonthly(item.amount, item.frequency))}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeItem('inflow', item.id)} className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Outflows Tab */}
            <TabsContent value="outflows" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-red-500" />
                      Expenses
                    </CardTitle>
                    <Button onClick={() => addItem('outflow')} size="sm">
                      <Plus className="h-4 w-4 mr-1" /> Add Expense
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {outflows.map((item) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 border rounded-lg items-end">
                      <div className="space-y-1">
                        <Label className="text-xs">Category</Label>
                        <Select value={item.category} onValueChange={(v) => updateItem('outflow', item.id, 'category', v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {outflowCategories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem('outflow', item.id, 'description', e.target.value)}
                          placeholder="Details..."
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Amount (₹)</Label>
                        <Input
                          type="number"
                          value={item.amount}
                          onChange={(e) => updateItem('outflow', item.id, 'amount', Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Frequency</Label>
                        <Select value={item.frequency} onValueChange={(v) => updateItem('outflow', item.id, 'frequency', v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="annually">Annually</SelectItem>
                            <SelectItem value="one-time">One-time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Monthly Equiv.</Label>
                        <p className="text-sm font-semibold text-red-500 p-2">
                          {formatCurrency(toMonthly(item.amount, item.frequency))}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeItem('outflow', item.id)} className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Expense Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sortedCategories.map(([category, amount]) => (
                        <div key={category} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{category}</span>
                            <span className="font-medium">{formatCurrency(amount)} ({((amount / totalMonthlyOutflow) * 100).toFixed(1)}%)</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${(amount / totalMonthlyOutflow) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PiggyBank className="h-5 w-5 text-primary" />
                      Financial Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">Annual Income</p>
                        <p className="text-xl font-bold text-green-500">{formatCurrency(totalMonthlyInflow * 12)}</p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">Annual Expenses</p>
                        <p className="text-xl font-bold text-red-500">{formatCurrency(totalMonthlyOutflow * 12)}</p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">Annual Savings</p>
                        <p className={`text-xl font-bold ${monthlySurplus >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(monthlySurplus * 12)}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">Emergency Fund Needed</p>
                        <p className="text-xl font-bold text-amber-500">{formatCurrency(emergencyFundRequired)}</p>
                        <p className="text-xs text-muted-foreground">{emergencyMonths} months expenses</p>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg space-y-2">
                      <h4 className="font-semibold">Savings Rate Assessment</h4>
                      <div className={`p-3 rounded-lg ${
                        savingsRate >= 30 ? 'bg-green-500/10 border-green-500/30' :
                        savingsRate >= 20 ? 'bg-green-500/10 border-green-500/30' :
                        savingsRate >= 10 ? 'bg-amber-500/10 border-amber-500/30' :
                        'bg-red-500/10 border-red-500/30'
                      } border`}>
                        <p className="text-sm">
                          {savingsRate >= 30 ? '🎉 Excellent! You\'re saving more than 30% of your income.' :
                           savingsRate >= 20 ? '👍 Good job! You\'re on track with 20%+ savings rate.' :
                           savingsRate >= 10 ? '⚠️ Consider increasing savings to at least 20% of income.' :
                           '🚨 Low savings rate. Review expenses and find areas to cut.'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Projection Tab */}
            <TabsContent value="projection" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cash Flow Projection Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Projection Period (Months)</Label>
                      <Input
                        type="number"
                        value={projectionMonths}
                        onChange={(e) => setProjectionMonths(Number(e.target.value))}
                        min={1}
                        max={60}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Inflation Rate (%)</Label>
                      <Input
                        type="number"
                        value={inflationRate}
                        onChange={(e) => setInflationRate(Number(e.target.value))}
                        step={0.5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Emergency Fund Months</Label>
                      <Input
                        type="number"
                        value={emergencyMonths}
                        onChange={(e) => setEmergencyMonths(Number(e.target.value))}
                        min={3}
                        max={12}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{projectionMonths}-Month Cash Flow Projection</CardTitle>
                  <CardDescription>Based on {inflationRate}% annual inflation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Month</th>
                          <th className="text-right p-3">Inflow</th>
                          <th className="text-right p-3">Outflow</th>
                          <th className="text-right p-3">Surplus</th>
                          <th className="text-right p-3">Cumulative Savings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projection.map((row) => (
                          <tr key={row.month} className="border-b">
                            <td className="p-3 font-medium">Month {row.month}</td>
                            <td className="p-3 text-right text-green-500">{formatCurrency(row.inflow)}</td>
                            <td className="p-3 text-right text-red-500">{formatCurrency(row.outflow)}</td>
                            <td className={`p-3 text-right font-semibold ${row.surplus >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {formatCurrency(row.surplus)}
                            </td>
                            <td className={`p-3 text-right ${row.cumulativeSavings >= 0 ? 'text-primary' : 'text-red-500'}`}>
                              {formatCurrency(row.cumulativeSavings)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-muted/30 font-bold">
                          <td className="p-3">Total / Average</td>
                          <td className="p-3 text-right text-green-500">{formatCurrency(totalMonthlyInflow * projectionMonths)}</td>
                          <td className="p-3 text-right text-red-500">{formatCurrency(projection.reduce((s, r) => s + r.outflow, 0))}</td>
                          <td className="p-3 text-right">{formatCurrency(projection.reduce((s, r) => s + r.surplus, 0))}</td>
                          <td className="p-3 text-right text-primary">{formatCurrency(projection[projection.length - 1]?.cumulativeSavings || 0)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Disclaimer */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                This tool provides estimates for budgeting and planning purposes. Actual cash flows may vary based on 
                unforeseen expenses, income changes, and economic conditions.
              </p>
              <p>
                The inflation projection assumes a constant rate and linear increase, which may not reflect actual market conditions.
              </p>
              <p>
                For comprehensive financial planning, please consult a qualified financial advisor.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CashFlowBudgetingTool;
