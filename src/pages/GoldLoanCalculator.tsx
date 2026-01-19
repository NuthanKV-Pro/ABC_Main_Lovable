import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Coins, TrendingUp, AlertTriangle, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const GoldLoanCalculator = () => {
  const navigate = useNavigate();
  const [goldWeight, setGoldWeight] = useState<number>(10);
  const [purity, setPurity] = useState<string>("22");
  const [goldRate, setGoldRate] = useState<number>(6500);
  const [ltvRatio, setLtvRatio] = useState<number>(75);
  const [interestRate, setInterestRate] = useState<number>(10);
  const [tenure, setTenure] = useState<number>(12);

  // Purity factors
  const purityFactors: { [key: string]: number } = {
    "24": 1.0,
    "22": 0.9167,
    "18": 0.75,
    "14": 0.5833,
  };

  const purityLabels: { [key: string]: string } = {
    "24": "24K (99.9% Pure)",
    "22": "22K (91.67% Pure)",
    "18": "18K (75% Pure)",
    "14": "14K (58.33% Pure)",
  };

  // Calculations
  const pureGoldWeight = goldWeight * purityFactors[purity];
  const goldValue = pureGoldWeight * goldRate;
  const maxLoanAmount = goldValue * (ltvRatio / 100);
  const monthlyInterest = (maxLoanAmount * interestRate) / (12 * 100);
  const totalInterest = monthlyInterest * tenure;
  const totalRepayment = maxLoanAmount + totalInterest;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20">
            <Coins className="w-8 h-8 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Gold Loan Calculator</h1>
            <p className="text-muted-foreground">Estimate loan amount based on your gold</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Input Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5" />
                Gold Details
              </CardTitle>
              <CardDescription>Enter your gold specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goldWeight">Gold Weight (grams)</Label>
                <Input
                  id="goldWeight"
                  type="number"
                  value={goldWeight}
                  onChange={(e) => setGoldWeight(Number(e.target.value))}
                  min={1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purity">Gold Purity</Label>
                <Select value={purity} onValueChange={setPurity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(purityLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goldRate">Current Gold Rate (₹/gram for 24K)</Label>
                <Input
                  id="goldRate"
                  type="number"
                  value={goldRate}
                  onChange={(e) => setGoldRate(Number(e.target.value))}
                  min={1000}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the current 24K gold rate per gram in your area
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ltv">LTV Ratio (%)</Label>
                <Select value={ltvRatio.toString()} onValueChange={(v) => setLtvRatio(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">60% (Conservative)</SelectItem>
                    <SelectItem value="70">70% (Standard)</SelectItem>
                    <SelectItem value="75">75% (Maximum - RBI Limit)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  RBI allows maximum 75% LTV for gold loans
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (% per annum)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  min={1}
                  max={30}
                  step={0.1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenure">Loan Tenure (months)</Label>
                <Input
                  id="tenure"
                  type="number"
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  min={1}
                  max={36}
                />
              </div>
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Loan Estimation
              </CardTitle>
              <CardDescription>Based on your gold specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pure Gold Equivalent</span>
                  <span className="font-semibold">{pureGoldWeight.toFixed(2)} grams</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Gold Value</span>
                  <span className="font-semibold">₹{goldValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">LTV Applied</span>
                  <span className="font-semibold">{ltvRatio}%</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
                <p className="text-sm text-muted-foreground mb-1">Maximum Loan Amount</p>
                <p className="text-3xl font-bold text-yellow-600">
                  ₹{maxLoanAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Interest</span>
                  <span className="font-semibold">₹{monthlyInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Interest ({tenure} months)</span>
                  <span className="font-semibold">₹{totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="font-medium">Total Repayment</span>
                  <span className="font-bold text-primary">₹{totalRepayment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>How it works</AlertTitle>
                <AlertDescription className="text-xs">
                  Gold loan amount depends on: weight × purity factor × gold rate × LTV ratio. 
                  Most lenders offer bullet repayment (principal at end, interest monthly) or EMI options.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <Alert variant="destructive" className="mt-6 bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Disclaimer</AlertTitle>
          <AlertDescription>
            This is an indicative calculation only. Actual loan amount, interest rates, and terms vary by lender. 
            Gold valuation, purity assessment, and LTV ratios are subject to the lender's policies. 
            Processing fees, insurance, and other charges may apply. Please consult with your bank or NBFC for accurate quotes.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default GoldLoanCalculator;
