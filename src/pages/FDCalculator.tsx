import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ExternalLink, Banknote, TrendingUp, Wallet } from "lucide-react";
import Footer from "@/components/Footer";

const FDCalculator = () => {
  const navigate = useNavigate();
  const [principal, setPrincipal] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(7);
  const [tenure, setTenure] = useState<number>(5);
  const [compoundingFrequency, setCompoundingFrequency] = useState<number>(4); // Quarterly

  // FD Maturity Calculation: A = P(1 + r/n)^(nt)
  const n = compoundingFrequency;
  const r = interestRate / 100;
  const t = tenure;
  const maturityAmount = principal * Math.pow(1 + r / n, n * t);
  const totalInterest = maturityAmount - principal;

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
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">FD Calculator</h1>
              <p className="text-sm text-muted-foreground">Calculate Fixed Deposit maturity amount</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Input Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-primary" />
                FD Details
              </CardTitle>
              <CardDescription>Enter your Fixed Deposit details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label htmlFor="principal">Principal Amount (₹)</Label>
                  <span className="text-sm font-medium text-primary">{formatCurrency(principal)}</span>
                </div>
                <Input
                  id="principal"
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  className="mb-2"
                />
                <Slider
                  value={[principal]}
                  onValueChange={(value) => setPrincipal(value[0])}
                  min={10000}
                  max={10000000}
                  step={10000}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹10K</span>
                  <span>₹1Cr</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label htmlFor="interestRate">Interest Rate (% p.a.)</Label>
                  <span className="text-sm font-medium text-primary">{interestRate}%</span>
                </div>
                <Input
                  id="interestRate"
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  step="0.1"
                  className="mb-2"
                />
                <Slider
                  value={[interestRate]}
                  onValueChange={(value) => setInterestRate(value[0])}
                  min={1}
                  max={15}
                  step={0.1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1%</span>
                  <span>15%</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label htmlFor="tenure">Tenure (Years)</Label>
                  <span className="text-sm font-medium text-primary">{tenure} years</span>
                </div>
                <Input
                  id="tenure"
                  type="number"
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="mb-2"
                />
                <Slider
                  value={[tenure]}
                  onValueChange={(value) => setTenure(value[0])}
                  min={1}
                  max={10}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 year</span>
                  <span>10 years</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Compounding Frequency</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 1, label: "Yearly" },
                    { value: 2, label: "Half-Yearly" },
                    { value: 4, label: "Quarterly" },
                    { value: 12, label: "Monthly" }
                  ].map((freq) => (
                    <Button
                      key={freq.value}
                      variant={compoundingFrequency === freq.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCompoundingFrequency(freq.value)}
                      className="text-xs"
                    >
                      {freq.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Result Section */}
          <div className="space-y-6">
            <Card className="shadow-lg bg-gradient-to-br from-primary/10 to-accent/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Maturity Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary mb-2">
                  {formatCurrency(maturityAmount)}
                </div>
                <p className="text-muted-foreground">
                  After {tenure} years at {interestRate}% p.a.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  Investment Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Principal Amount</span>
                  <span className="font-semibold">{formatCurrency(principal)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                  <span className="text-muted-foreground">Total Interest Earned</span>
                  <span className="font-semibold text-green-600">{formatCurrency(totalInterest)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                  <span className="text-muted-foreground">Maturity Amount</span>
                  <span className="font-bold text-primary">{formatCurrency(maturityAmount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* External Calculator Links */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Compare with Other Calculators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => window.open("https://groww.in/calculators/fd-calculator", "_blank")}
                >
                  Groww's FD Calculator
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => window.open("https://cleartax.in/s/fd-calculator", "_blank")}
                >
                  ClearTax's FD Calculator
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FDCalculator;
