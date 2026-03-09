import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2, Briefcase, TrendingUp } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Income {
  id: string;
  source: string;
  type: "freelance" | "rental" | "investment" | "business" | "other";
  amount: number;
  month: string;
  expenses: number;
}

const SideHustleTracker = () => {
  const goBack = useGoBack();
  const [incomes, setIncomes] = useState<Income[]>([
    { id: "1", source: "Web Development", type: "freelance", amount: 50000, month: "2024-12", expenses: 5000 },
    { id: "2", source: "Content Writing", type: "freelance", amount: 25000, month: "2024-12", expenses: 2000 },
    { id: "3", source: "Flat Rental", type: "rental", amount: 18000, month: "2024-12", expenses: 3000 },
    { id: "4", source: "Stock Dividends", type: "investment", amount: 8000, month: "2024-12", expenses: 0 },
    { id: "5", source: "Online Course", type: "business", amount: 35000, month: "2024-11", expenses: 10000 },
  ]);

  const [newIncome, setNewIncome] = useState({ source: "", type: "freelance" as const, amount: "", month: "", expenses: "" });

  const addIncome = () => {
    if (newIncome.source && newIncome.amount && newIncome.month) {
      setIncomes([...incomes, {
        id: Date.now().toString(),
        source: newIncome.source,
        type: newIncome.type,
        amount: parseFloat(newIncome.amount) || 0,
        month: newIncome.month,
        expenses: parseFloat(newIncome.expenses) || 0
      }]);
      setNewIncome({ source: "", type: "freelance", amount: "", month: "", expenses: "" });
    }
  };

  const deleteIncome = (id: string) => {
    setIncomes(incomes.filter(i => i.id !== id));
  };

  const totalGross = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = incomes.reduce((sum, i) => sum + i.expenses, 0);
  const totalNet = totalGross - totalExpenses;

  // Tax calculation (presumptive for freelance/business under 50L)
  const freelanceIncome = incomes.filter(i => i.type === "freelance" || i.type === "business").reduce((sum, i) => sum + i.amount, 0);
  const freelanceExpenses = incomes.filter(i => i.type === "freelance" || i.type === "business").reduce((sum, i) => sum + i.expenses, 0);
  const otherIncome = incomes.filter(i => i.type !== "freelance" && i.type !== "business").reduce((sum, i) => sum + i.amount - i.expenses, 0);
  
  // 50% presumptive income for profession under 44ADA
  const presumptiveIncome = freelanceIncome * 0.5;
  const taxableIncome = presumptiveIncome + otherIncome;
  
  // Simplified tax (new regime)
  let estimatedTax = 0;
  if (taxableIncome > 1500000) estimatedTax = (taxableIncome - 1500000) * 0.30 + 150000;
  else if (taxableIncome > 1200000) estimatedTax = (taxableIncome - 1200000) * 0.20 + 90000;
  else if (taxableIncome > 900000) estimatedTax = (taxableIncome - 900000) * 0.15 + 45000;
  else if (taxableIncome > 600000) estimatedTax = (taxableIncome - 600000) * 0.10 + 15000;
  else if (taxableIncome > 300000) estimatedTax = (taxableIncome - 300000) * 0.05;

  // Monthly breakdown
  const monthlyData = incomes.reduce((acc, inc) => {
    if (!acc[inc.month]) acc[inc.month] = { gross: 0, expenses: 0, net: 0 };
    acc[inc.month].gross += inc.amount;
    acc[inc.month].expenses += inc.expenses;
    acc[inc.month].net += (inc.amount - inc.expenses);
    return acc;
  }, {} as Record<string, { gross: number; expenses: number; net: number }>);

  const chartData = Object.entries(monthlyData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, data]) => ({
      month: new Date(month + "-01").toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      gross: data.gross,
      expenses: data.expenses,
      net: data.net
    }));

  const typeLabels: Record<string, string> = {
    freelance: "Freelance",
    rental: "Rental",
    investment: "Investment",
    business: "Business",
    other: "Other"
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Button variant="ghost" onClick={goBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Side Hustle Tracker</CardTitle>
              <CardDescription>Track multiple income sources and tax implications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Gross Income</p>
                <p className="text-xl font-bold text-green-500">₹{totalGross.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Expenses</p>
                <p className="text-xl font-bold text-red-500">₹{totalExpenses.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/30">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Net Income</p>
                <p className="text-xl font-bold text-primary">₹{totalNet.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Est. Tax</p>
                <p className="text-xl font-bold text-amber-500">₹{Math.round(estimatedTax).toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Income Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} className="text-xs" />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <Bar dataKey="gross" name="Gross" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="net" name="Net" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Add Income Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div>
                  <Label>Source</Label>
                  <Input
                    placeholder="Web Dev"
                    value={newIncome.source}
                    onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={newIncome.type}
                    onChange={(e) => setNewIncome({ ...newIncome, type: e.target.value as any })}
                  >
                    <option value="freelance">Freelance</option>
                    <option value="business">Business</option>
                    <option value="rental">Rental</option>
                    <option value="investment">Investment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="50000"
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Month</Label>
                  <Input
                    type="month"
                    value={newIncome.month}
                    onChange={(e) => setNewIncome({ ...newIncome, month: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Expenses (₹)</Label>
                  <Input
                    type="number"
                    placeholder="5000"
                    value={newIncome.expenses}
                    onChange={(e) => setNewIncome({ ...newIncome, expenses: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addIncome} className="w-full">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Expenses</TableHead>
                <TableHead className="text-right">Net</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomes.map((inc) => (
                <TableRow key={inc.id}>
                  <TableCell className="font-medium">{inc.source}</TableCell>
                  <TableCell>{typeLabels[inc.type]}</TableCell>
                  <TableCell>{inc.month}</TableCell>
                  <TableCell className="text-right font-mono text-green-500">₹{inc.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-red-500">₹{inc.expenses.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono font-bold">₹{(inc.amount - inc.expenses).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => deleteIncome(inc.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Card className="bg-primary/5 border-primary/30">
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Tax Estimation (44ADA Presumptive)
              </h4>
              <div className="grid gap-2 text-sm md:grid-cols-3">
                <div>
                  <p className="text-muted-foreground">Freelance/Business Income</p>
                  <p className="font-mono">₹{freelanceIncome.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Presumptive Income (50%)</p>
                  <p className="font-mono">₹{presumptiveIncome.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Estimated Tax Liability</p>
                  <p className="font-mono font-bold text-primary">₹{Math.round(estimatedTax).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default SideHustleTracker;
