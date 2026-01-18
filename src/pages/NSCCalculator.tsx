import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, FileText, ExternalLink } from "lucide-react";
import Footer from "@/components/Footer";

const NSCCalculator = () => {
  const navigate = useNavigate();
  const [principal, setPrincipal] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(7.7);
  const tenure = 5; // NSC has fixed 5-year tenure

  // NSC compounds annually
  const maturityAmount = principal * Math.pow(1 + interestRate / 100, tenure);
  const totalInterest = maturityAmount - principal;

  // Year-wise breakdown
  const yearlyBreakdown = Array.from({ length: tenure }, (_, i) => {
    const year = i + 1;
    const amount = principal * Math.pow(1 + interestRate / 100, year);
    const interest = amount - principal;
    return { year, amount, interest };
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">NSC Calculator</h1>
              <p className="text-sm text-muted-foreground">National Savings Certificate Returns</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                NSC Details
              </CardTitle>
              <CardDescription>Enter your NSC investment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="principal">Investment Amount (₹)</Label>
                <Input
                  id="principal"
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  min={1000}
                />
                <p className="text-xs text-muted-foreground">Minimum: ₹1,000 | No maximum limit</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (% p.a.)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  min={1}
                  max={15}
                  step={0.1}
                />
                <p className="text-xs text-muted-foreground">Current rate: 7.7% (Jan-Mar 2024)</p>
              </div>
              <div className="space-y-2">
                <Label>Lock-in Period</Label>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-semibold">5 Years (Fixed)</p>
                  <p className="text-xs text-muted-foreground">NSC has a mandatory 5-year lock-in</p>
                </div>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm font-medium text-primary">Tax Benefits</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Investment qualifies for deduction under Section 80C (up to ₹1.5 lakh)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle>NSC Maturity Summary</CardTitle>
              <CardDescription>Your estimated returns after 5 years</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-card rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Maturity Amount</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(maturityAmount)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-card rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Principal</p>
                  <p className="text-lg font-semibold">{formatCurrency(principal)}</p>
                </div>
                <div className="text-center p-4 bg-card rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Total Interest</p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(totalInterest)}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Year-wise Growth</p>
                <div className="space-y-2">
                  {yearlyBreakdown.map((item) => (
                    <div key={item.year} className="flex justify-between items-center p-2 bg-card rounded border text-sm">
                      <span>Year {item.year}</span>
                      <span className="font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto mt-6 flex gap-4 justify-center">
          <Button variant="outline" onClick={() => window.open("https://groww.in/calculators/nsc-calculator", "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" /> Groww NSC Calc
          </Button>
          <Button variant="outline" onClick={() => window.open("https://cleartax.in/s/nsc-national-savings-certificate", "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" /> ClearTax NSC Info
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NSCCalculator;
