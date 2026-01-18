import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Landmark, ExternalLink } from "lucide-react";
import Footer from "@/components/Footer";

const PPFCalculator = () => {
  const navigate = useNavigate();
  const [yearlyContribution, setYearlyContribution] = useState<string>("150000");
  const [duration, setDuration] = useState<string>("15");
  const [interestRate, setInterestRate] = useState<string>("7.1");

  const calculatePPF = () => {
    const P = parseFloat(yearlyContribution) || 0;
    const n = parseFloat(duration) || 15;
    const r = (parseFloat(interestRate) || 7.1) / 100;

    if (P <= 0 || n < 15) {
      return { maturityAmount: 0, totalInvested: 0, totalInterest: 0 };
    }

    // PPF compounds annually, contribution made at start of year
    // For each year: A = P * ((1+r)^n - 1) / r * (1+r)
    let maturityAmount = 0;
    for (let year = 1; year <= n; year++) {
      maturityAmount = (maturityAmount + P) * (1 + r);
    }

    const totalInvested = P * n;
    const totalInterest = maturityAmount - totalInvested;

    return {
      maturityAmount: Math.round(maturityAmount),
      totalInvested: Math.round(totalInvested),
      totalInterest: Math.round(totalInterest)
    };
  };

  const result = calculatePPF();

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
              <h1 className="text-2xl font-bold text-primary">PPF Calculator</h1>
              <p className="text-sm text-muted-foreground">Calculate your PPF maturity amount</p>
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
                  <Landmark className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">PPF Calculator</CardTitle>
                  <CardDescription>
                    Calculate Public Provident Fund maturity amount
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Inputs */}
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yearlyContribution">Yearly Contribution (₹)</Label>
                  <Input
                    id="yearlyContribution"
                    type="number"
                    placeholder="Enter yearly contribution"
                    value={yearlyContribution}
                    onChange={(e) => setYearlyContribution(e.target.value)}
                    min="500"
                    max="150000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Min: ₹500 | Max: ₹1,50,000 per year
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Investment Duration (Years)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="Enter duration in years"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="15"
                    max="50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum lock-in: 15 years (can extend in 5-year blocks)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interestRate">Current PPF Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    placeholder="Enter interest rate"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    min="1"
                    max="15"
                    step="0.1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Current rate (FY 2024-25): 7.1% p.a. (subject to quarterly revision)
                  </p>
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
                    <p className="text-sm text-muted-foreground mb-1">Total Interest Earned</p>
                    <p className="text-2xl font-bold text-green-500">
                      +{formatCurrency(result.totalInterest)}
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

              {/* PPF Benefits */}
              <div className="p-4 rounded-lg bg-muted/50 border">
                <p className="text-sm font-medium mb-2">PPF Benefits:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• EEE status (Exempt-Exempt-Exempt) - Tax-free investment</li>
                  <li>• Section 80C deduction up to ₹1.5 lakh</li>
                  <li>• Government-backed, risk-free returns</li>
                  <li>• Loan facility available from 3rd to 6th year</li>
                </ul>
              </div>

              {/* External Links */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open("https://groww.in/calculators/ppf-calculator", "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Groww's PPF Calculator
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open("https://cleartax.in/s/ppf-calculator", "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  ClearTax's PPF Calculator
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PPFCalculator;
