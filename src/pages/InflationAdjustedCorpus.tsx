import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, TrendingDown, Calculator } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const InflationAdjustedCorpus = () => {
  const goBack = useGoBack();
  const [currentExpenses, setCurrentExpenses] = useState("50000");
  const [years, setYears] = useState("20");
  const [inflationRate, setInflationRate] = useState("6");
  const [expectedReturn, setExpectedReturn] = useState("10");
  const [retirementYears, setRetirementYears] = useState("25");

  const monthly = parseFloat(currentExpenses) || 0;
  const period = parseInt(years) || 20;
  const inflation = parseFloat(inflationRate) / 100 || 0.06;
  const returns = parseFloat(expectedReturn) / 100 || 0.10;
  const retirementPeriod = parseInt(retirementYears) || 25;

  // Future monthly expense (inflation adjusted)
  const futureMonthlyExpense = monthly * Math.pow(1 + inflation, period);
  const futureAnnualExpense = futureMonthlyExpense * 12;

  // Corpus required using annuity formula (inflation-adjusted withdrawals)
  const realRate = (1 + returns) / (1 + inflation) - 1;
  const corpusRequired = realRate > 0 
    ? futureAnnualExpense * ((1 - Math.pow(1 + realRate, -retirementPeriod)) / realRate)
    : futureAnnualExpense * retirementPeriod;

  // Monthly SIP needed to reach corpus
  const monthlyRate = returns / 12;
  const months = period * 12;
  const sipRequired = corpusRequired * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);

  // Chart data showing purchasing power erosion
  const chartData = [];
  for (let i = 0; i <= period; i += 2) {
    const futureValue = monthly * Math.pow(1 + inflation, i);
    const purchasingPower = monthly / Math.pow(1 + inflation, i);
    chartData.push({
      year: `Year ${i}`,
      futureExpense: Math.round(futureValue),
      purchasingPowerOf50K: Math.round(purchasingPower)
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
            <TrendingDown className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Inflation-Adjusted Corpus Calculator</CardTitle>
              <CardDescription>Calculate future value with inflation erosion for retirement planning</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Your Inputs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Current Monthly Expenses (₹)</Label>
                  <Input
                    type="number"
                    value={currentExpenses}
                    onChange={(e) => setCurrentExpenses(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Years to Retirement</Label>
                  <Input
                    type="number"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Expected Inflation (%)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={inflationRate}
                    onChange={(e) => setInflationRate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Expected Return on Corpus (%)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Retirement Duration (Years)</Label>
                  <Input
                    type="number"
                    value={retirementYears}
                    onChange={(e) => setRetirementYears(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="bg-red-500/10 border-red-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    <span className="font-medium">Inflation Impact</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Today's ₹{monthly.toLocaleString()}/month will become</p>
                      <p className="text-2xl font-bold text-red-500">₹{Math.round(futureMonthlyExpense).toLocaleString()}/month</p>
                      <p className="text-xs text-muted-foreground">in {period} years at {(inflation * 100).toFixed(1)}% inflation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    <span className="font-medium">Corpus Required</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">₹{(corpusRequired / 10000000).toFixed(2)} Cr</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    To sustain ₹{Math.round(futureMonthlyExpense).toLocaleString()}/month for {retirementPeriod} years
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">SIP Required</span>
                  </div>
                  <p className="text-3xl font-bold text-green-500">₹{Math.round(sipRequired).toLocaleString()}/month</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    For {period} years at {(returns * 100).toFixed(1)}% returns
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Inflation Erosion Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="year" className="text-xs" />
                  <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} className="text-xs" />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `₹${value.toLocaleString()}`,
                      name === "futureExpense" ? "Future Monthly Need" : "Purchasing Power"
                    ]}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="futureExpense" 
                    name="Future Monthly Need"
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="purchasingPowerOf50K" 
                    name={`Today's ₹${monthly.toLocaleString()} becomes`}
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-2">💡 Key Insights</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• At 6% inflation, prices double every 12 years (Rule of 72)</li>
                <li>• Your corpus must beat inflation to maintain lifestyle</li>
                <li>• Real return = Nominal return - Inflation</li>
                <li>• Consider healthcare inflation (8-10%) for medical expenses separately</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default InflationAdjustedCorpus;
