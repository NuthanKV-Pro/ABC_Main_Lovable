import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Target, TrendingUp } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";

const BreakevenAnalysis = () => {
  const goBack = useGoBack();
  const [fixedCosts, setFixedCosts] = useState("500000");
  const [sellingPrice, setSellingPrice] = useState("1000");
  const [variableCost, setVariableCost] = useState("600");
  const [targetProfit, setTargetProfit] = useState("200000");

  const fixed = parseFloat(fixedCosts) || 0;
  const price = parseFloat(sellingPrice) || 0;
  const variable = parseFloat(variableCost) || 0;
  const target = parseFloat(targetProfit) || 0;

  const contributionMargin = price - variable;
  const contributionMarginRatio = price > 0 ? (contributionMargin / price) * 100 : 0;
  const breakEvenUnits = contributionMargin > 0 ? Math.ceil(fixed / contributionMargin) : 0;
  const breakEvenRevenue = breakEvenUnits * price;
  const unitsForTargetProfit = contributionMargin > 0 ? Math.ceil((fixed + target) / contributionMargin) : 0;
  const revenueForTargetProfit = unitsForTargetProfit * price;

  // Chart data
  const maxUnits = Math.max(breakEvenUnits * 2, unitsForTargetProfit * 1.2);
  const chartData = [];
  for (let units = 0; units <= maxUnits; units += Math.ceil(maxUnits / 20)) {
    const revenue = units * price;
    const totalCost = fixed + (units * variable);
    const profit = revenue - totalCost;
    chartData.push({
      units,
      revenue,
      totalCost,
      profit,
      fixedCost: fixed
    });
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Button variant="ghost" onClick={goBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Break-even Analysis</CardTitle>
              <CardDescription>Calculate the point where revenue equals total costs</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Cost & Revenue Inputs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Fixed Costs (₹)</Label>
                  <Input
                    type="number"
                    value={fixedCosts}
                    onChange={(e) => setFixedCosts(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Rent, salaries, insurance, etc.</p>
                </div>
                <div>
                  <Label>Selling Price per Unit (₹)</Label>
                  <Input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Variable Cost per Unit (₹)</Label>
                  <Input
                    type="number"
                    value={variableCost}
                    onChange={(e) => setVariableCost(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Raw materials, direct labor, etc.</p>
                </div>
                <div>
                  <Label>Target Profit (₹)</Label>
                  <Input
                    type="number"
                    value={targetProfit}
                    onChange={(e) => setTargetProfit(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="bg-blue-500/10 border-blue-500/30">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-3">Contribution Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Contribution Margin/Unit:</span>
                      <span className="font-mono font-bold">₹{contributionMargin.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contribution Margin Ratio:</span>
                      <span className="font-mono">{contributionMarginRatio.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Break-even Point</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Units</p>
                      <p className="text-2xl font-bold text-primary">{breakEvenUnits.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="text-2xl font-bold text-primary">₹{breakEvenRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">Target Profit (₹{target.toLocaleString()})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Units Required</p>
                      <p className="text-2xl font-bold text-green-500">{unitsForTargetProfit.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue Required</p>
                      <p className="text-2xl font-bold text-green-500">₹{revenueForTargetProfit.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Cost-Volume-Profit Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="units" 
                    className="text-xs"
                    tickFormatter={(v) => v.toLocaleString()}
                    label={{ value: 'Units', position: 'bottom', offset: -5 }}
                  />
                  <YAxis 
                    tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} 
                    className="text-xs"
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `₹${value.toLocaleString()}`,
                      name
                    ]}
                    labelFormatter={(label) => `Units: ${label.toLocaleString()}`}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <ReferenceLine 
                    x={breakEvenUnits} 
                    stroke="hsl(var(--primary))" 
                    strokeDasharray="5 5"
                    label={{ value: 'BEP', position: 'top' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Revenue"
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalCost" 
                    name="Total Cost"
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="fixedCost" 
                    name="Fixed Cost"
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-2">📊 Key Formulas</h4>
              <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                <div>
                  <p><strong>Break-even Units</strong> = Fixed Costs ÷ Contribution Margin</p>
                  <p><strong>Contribution Margin</strong> = Selling Price - Variable Cost</p>
                </div>
                <div>
                  <p><strong>Units for Target Profit</strong> = (Fixed Costs + Target Profit) ÷ CM</p>
                  <p><strong>Margin of Safety</strong> = Actual Sales - Break-even Sales</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default BreakevenAnalysis;
