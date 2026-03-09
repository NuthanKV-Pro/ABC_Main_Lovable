import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calculator, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";

const WorkingCapitalCalculator = () => {
  const goBack = useGoBack();
  const [currentAssets, setCurrentAssets] = useState("");
  const [currentLiabilities, setCurrentLiabilities] = useState("");
  const [inventory, setInventory] = useState("");
  const [receivables, setReceivables] = useState("");
  const [payables, setPayables] = useState("");
  const [annualSales, setAnnualSales] = useState("");
  const [cogs, setCogs] = useState("");

  const ca = parseFloat(currentAssets) || 0;
  const cl = parseFloat(currentLiabilities) || 0;
  const inv = parseFloat(inventory) || 0;
  const rec = parseFloat(receivables) || 0;
  const pay = parseFloat(payables) || 0;
  const sales = parseFloat(annualSales) || 0;
  const costOfGoods = parseFloat(cogs) || 0;

  // Working Capital Metrics
  const workingCapital = ca - cl;
  const currentRatio = cl > 0 ? ca / cl : 0;
  const quickRatio = cl > 0 ? (ca - inv) / cl : 0;
  const cashRatio = cl > 0 ? (ca - inv - rec) / cl : 0;

  // Operating Cycle (in days)
  const dailySales = sales / 365;
  const dailyCogs = costOfGoods / 365;
  const dso = dailySales > 0 ? rec / dailySales : 0; // Days Sales Outstanding
  const dio = dailyCogs > 0 ? inv / dailyCogs : 0; // Days Inventory Outstanding
  const dpo = dailyCogs > 0 ? pay / dailyCogs : 0; // Days Payable Outstanding
  const operatingCycle = dso + dio;
  const cashConversionCycle = operatingCycle - dpo;

  // Working Capital Turnover
  const wcTurnover = workingCapital > 0 ? sales / workingCapital : 0;

  const getHealthStatus = () => {
    if (currentRatio >= 2 && quickRatio >= 1 && cashConversionCycle < 60) {
      return { status: "Excellent", color: "text-green-500", bg: "bg-green-500/10" };
    } else if (currentRatio >= 1.5 && quickRatio >= 0.8) {
      return { status: "Good", color: "text-blue-500", bg: "bg-blue-500/10" };
    } else if (currentRatio >= 1) {
      return { status: "Fair", color: "text-amber-500", bg: "bg-amber-500/10" };
    } else {
      return { status: "Poor", color: "text-red-500", bg: "bg-red-500/10" };
    }
  };

  const health = getHealthStatus();

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Button variant="ghost" onClick={goBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Calculator className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Working Capital Calculator</CardTitle>
              <CardDescription>Analyze liquidity, operating cycle, and cash conversion</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Balance Sheet Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Current Assets (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 5000000"
                    value={currentAssets}
                    onChange={(e) => setCurrentAssets(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Current Liabilities (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 3000000"
                    value={currentLiabilities}
                    onChange={(e) => setCurrentLiabilities(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Inventory (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 1500000"
                    value={inventory}
                    onChange={(e) => setInventory(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Accounts Receivable (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 2000000"
                    value={receivables}
                    onChange={(e) => setReceivables(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Accounts Payable (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 1000000"
                    value={payables}
                    onChange={(e) => setPayables(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Income Statement Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Annual Sales/Revenue (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 20000000"
                    value={annualSales}
                    onChange={(e) => setAnnualSales(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Cost of Goods Sold (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 12000000"
                    value={cogs}
                    onChange={(e) => setCogs(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card className={`${health.bg} border-${health.color.replace('text-', '')}/30`}>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Net Working Capital</p>
                <p className={`text-xl font-bold ${health.color}`}>₹{(workingCapital / 100000).toFixed(1)}L</p>
                <Badge variant="outline" className="mt-2">{health.status}</Badge>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Current Ratio</p>
                <p className="text-xl font-bold text-blue-500">{currentRatio.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Ideal: ≥ 2.0</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Quick Ratio</p>
                <p className="text-xl font-bold text-purple-500">{quickRatio.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Ideal: ≥ 1.0</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Cash Ratio</p>
                <p className="text-xl font-bold text-amber-500">{cashRatio.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Ideal: ≥ 0.5</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-primary/5 border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Operating & Cash Cycle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-4">
                <div className="text-center p-4 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground">DSO</p>
                  <p className="text-2xl font-bold">{Math.round(dso)}</p>
                  <p className="text-xs text-muted-foreground">Days Sales Outstanding</p>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground">DIO</p>
                  <p className="text-2xl font-bold">{Math.round(dio)}</p>
                  <p className="text-xs text-muted-foreground">Days Inventory Outstanding</p>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground">DPO</p>
                  <p className="text-2xl font-bold">{Math.round(dpo)}</p>
                  <p className="text-xs text-muted-foreground">Days Payable Outstanding</p>
                </div>
                <div className="text-center p-4 bg-background rounded-lg border-2 border-primary/30">
                  <p className="text-sm text-muted-foreground">Cash Conversion Cycle</p>
                  <p className={`text-2xl font-bold ${cashConversionCycle < 45 ? "text-green-500" : cashConversionCycle < 90 ? "text-amber-500" : "text-red-500"}`}>
                    {Math.round(cashConversionCycle)} days
                  </p>
                  <p className="text-xs text-muted-foreground">DSO + DIO - DPO</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-3">📈 Interpretation</h4>
              <div className="grid gap-4 md:grid-cols-2 text-sm">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    {currentRatio >= 1.5 ? <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" /> : <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />}
                    <span>Current Ratio {currentRatio >= 1.5 ? "indicates adequate liquidity" : "may indicate liquidity stress"}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    {quickRatio >= 1 ? <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" /> : <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />}
                    <span>Quick Ratio {quickRatio >= 1 ? "shows ability to meet short-term obligations" : "suggests dependence on inventory"}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    {cashConversionCycle < 60 ? <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" /> : <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />}
                    <span>Cash Cycle {cashConversionCycle < 60 ? "is efficient" : "may need improvement"}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
                    <span>Working Capital Turnover: {wcTurnover.toFixed(2)}x (higher is better)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkingCapitalCalculator;
