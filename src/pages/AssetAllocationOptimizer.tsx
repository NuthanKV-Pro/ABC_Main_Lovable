import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, PieChart, TrendingUp, Shield, Coins } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import { PieChart as RechartsP, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const AssetAllocationOptimizer = () => {
  const goBack = useGoBack();
  const [age, setAge] = useState("30");
  const [riskTolerance, setRiskTolerance] = useState([50]);
  const [investmentHorizon, setInvestmentHorizon] = useState("10");
  const [currentEquity, setCurrentEquity] = useState("");
  const [currentDebt, setCurrentDebt] = useState("");
  const [currentGold, setCurrentGold] = useState("");

  const calculateOptimalAllocation = () => {
    const userAge = parseInt(age) || 30;
    const risk = riskTolerance[0];
    const horizon = parseInt(investmentHorizon) || 10;

    // Base allocation using age rule
    let equity = Math.max(0, Math.min(100, 100 - userAge));
    
    // Adjust for risk tolerance
    if (risk < 30) {
      equity = Math.max(20, equity - 20);
    } else if (risk > 70) {
      equity = Math.min(80, equity + 15);
    }

    // Adjust for investment horizon
    if (horizon < 3) {
      equity = Math.min(equity, 30);
    } else if (horizon > 15) {
      equity = Math.min(equity + 10, 85);
    }

    const gold = 10;
    const debt = 100 - equity - gold;

    return {
      equity: Math.round(equity),
      debt: Math.round(debt),
      gold: Math.round(gold)
    };
  };

  const optimal = calculateOptimalAllocation();
  const currentTotal = (parseFloat(currentEquity) || 0) + (parseFloat(currentDebt) || 0) + (parseFloat(currentGold) || 0);
  
  const currentAllocation = currentTotal > 0 ? {
    equity: Math.round(((parseFloat(currentEquity) || 0) / currentTotal) * 100),
    debt: Math.round(((parseFloat(currentDebt) || 0) / currentTotal) * 100),
    gold: Math.round(((parseFloat(currentGold) || 0) / currentTotal) * 100)
  } : null;

  const optimalData = [
    { name: "Equity", value: optimal.equity, color: "hsl(var(--chart-1))" },
    { name: "Debt", value: optimal.debt, color: "hsl(var(--chart-2))" },
    { name: "Gold", value: optimal.gold, color: "hsl(var(--chart-3))" }
  ];

  const currentData = currentAllocation ? [
    { name: "Equity", value: currentAllocation.equity, color: "hsl(var(--chart-1))" },
    { name: "Debt", value: currentAllocation.debt, color: "hsl(var(--chart-2))" },
    { name: "Gold", value: currentAllocation.gold, color: "hsl(var(--chart-3))" }
  ] : null;

  const getRebalanceActions = () => {
    if (!currentAllocation || currentTotal === 0) return [];
    
    const actions = [];
    const equityDiff = optimal.equity - currentAllocation.equity;
    const debtDiff = optimal.debt - currentAllocation.debt;
    const goldDiff = optimal.gold - currentAllocation.gold;

    if (Math.abs(equityDiff) > 5) {
      actions.push({
        asset: "Equity",
        action: equityDiff > 0 ? "Increase" : "Decrease",
        amount: Math.abs(equityDiff),
        value: Math.abs(equityDiff * currentTotal / 100)
      });
    }
    if (Math.abs(debtDiff) > 5) {
      actions.push({
        asset: "Debt",
        action: debtDiff > 0 ? "Increase" : "Decrease",
        amount: Math.abs(debtDiff),
        value: Math.abs(debtDiff * currentTotal / 100)
      });
    }
    if (Math.abs(goldDiff) > 5) {
      actions.push({
        asset: "Gold",
        action: goldDiff > 0 ? "Increase" : "Decrease",
        amount: Math.abs(goldDiff),
        value: Math.abs(goldDiff * currentTotal / 100)
      });
    }

    return actions;
  };

  const rebalanceActions = getRebalanceActions();

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Button variant="ghost" onClick={goBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <PieChart className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Asset Allocation Optimizer</CardTitle>
              <CardDescription>Get optimal portfolio allocation based on age, risk, and goals</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Age: {age} years</Label>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="18"
                    max="80"
                  />
                </div>
                <div>
                  <Label>Risk Tolerance: {riskTolerance[0]}%</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs">Conservative</span>
                    <Slider
                      value={riskTolerance}
                      onValueChange={setRiskTolerance}
                      max={100}
                      step={10}
                      className="flex-1"
                    />
                    <span className="text-xs">Aggressive</span>
                  </div>
                </div>
                <div>
                  <Label>Investment Horizon: {investmentHorizon} years</Label>
                  <Input
                    type="number"
                    value={investmentHorizon}
                    onChange={(e) => setInvestmentHorizon(e.target.value)}
                    min="1"
                    max="40"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Optimal Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsP>
                    <Pie
                      data={optimalData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {optimalData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsP>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-chart-1" />
                    <span className="text-sm">Equity: {optimal.equity}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-chart-2" />
                    <span className="text-sm">Debt: {optimal.debt}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-chart-3" />
                    <span className="text-sm">Gold: {optimal.gold}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Current Portfolio (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Equity (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={currentEquity}
                    onChange={(e) => setCurrentEquity(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Debt (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={currentDebt}
                    onChange={(e) => setCurrentDebt(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Gold (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={currentGold}
                    onChange={(e) => setCurrentGold(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {rebalanceActions.length > 0 && (
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Rebalancing Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rebalanceActions.map((action, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium ${action.action === "Increase" ? "text-green-500" : "text-red-500"}`}>
                          {action.action}
                        </span>
                        <span>{action.asset}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-mono">by {action.amount}%</p>
                        <p className="text-sm text-muted-foreground">≈ ₹{Math.round(action.value).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetAllocationOptimizer;
