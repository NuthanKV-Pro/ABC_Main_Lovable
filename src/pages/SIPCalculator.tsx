import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, TrendingUp, ExternalLink } from "lucide-react";

const SIPCalculator = () => {
  const navigate = useNavigate();
  const [monthlyInvestment, setMonthlyInvestment] = useState<string>("10000");
  const [duration, setDuration] = useState<string>("10");
  const [expectedReturn, setExpectedReturn] = useState<string>("12");

  const calculateSIP = () => {
    const P = parseFloat(monthlyInvestment) || 0;
    const n = (parseFloat(duration) || 0) * 12; // months
    const r = (parseFloat(expectedReturn) || 0) / 100 / 12; // monthly rate

    if (P <= 0 || n <= 0 || r <= 0) {
      return { maturityAmount: 0, totalInvested: 0, totalReturns: 0 };
    }

    // SIP Formula: M = P × ({[1 + r]^n – 1} / r) × (1 + r)
    const maturityAmount = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const totalInvested = P * n;
    const totalReturns = maturityAmount - totalInvested;

    return {
      maturityAmount: Math.round(maturityAmount),
      totalInvested: Math.round(totalInvested),
      totalReturns: Math.round(totalReturns)
    };
  };

  const result = calculateSIP();

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">SIP Calculator</h1>
              <p className="text-sm text-muted-foreground">Calculate your SIP returns</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Calculator Card */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">SIP Calculator</CardTitle>
                  <CardDescription>
                    Calculate returns on your Systematic Investment Plan
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Inputs */}
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyInvestment">Monthly Investment (₹)</Label>
                  <Input
                    id="monthlyInvestment"
                    type="number"
                    placeholder="Enter monthly investment"
                    value={monthlyInvestment}
                    onChange={(e) => setMonthlyInvestment(e.target.value)}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Investment Duration (Years)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="Enter duration in years"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="1"
                    max="40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedReturn">Expected Annual Return (%)</Label>
                  <Input
                    id="expectedReturn"
                    type="number"
                    placeholder="Enter expected return"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(e.target.value)}
                    min="1"
                    max="30"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Results */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                <div className="grid gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total Invested</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(result.totalInvested)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total Returns</p>
                    <p className="text-2xl font-bold text-green-500">
                      +{formatCurrency(result.totalReturns)}
                    </p>
                  </div>
                  <div className="text-center pt-4 border-t border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">Maturity Amount</p>
                    <p className="text-4xl font-bold text-primary">
                      {formatCurrency(result.maturityAmount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Formula Info */}
              <div className="p-4 rounded-lg bg-muted/50 border">
                <p className="text-sm text-muted-foreground">
                  <strong>SIP Formula:</strong> M = P × ({'{'}[1 + r]^n – 1{'}'} / r) × (1 + r)
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Where P = Monthly investment, r = Monthly interest rate, n = Number of months
                </p>
              </div>

              {/* External Links */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open("https://groww.in/calculators/sip-calculator", "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Groww's SIP Calculator
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open("https://cleartax.in/s/sip-calculator", "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  ClearTax's SIP Calculator
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SIPCalculator;
