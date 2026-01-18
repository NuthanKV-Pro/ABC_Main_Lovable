import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Users, ExternalLink, Info } from "lucide-react";
import Footer from "@/components/Footer";

const SCSSCalculator = () => {
  const navigate = useNavigate();
  const [depositAmount, setDepositAmount] = useState<number>(1500000);
  const [interestRate, setInterestRate] = useState<number>(8.2);
  const tenure = 5; // SCSS has fixed 5-year tenure

  // SCSS pays quarterly interest
  const quarterlyInterest = (depositAmount * interestRate / 100) / 4;
  const yearlyInterest = depositAmount * interestRate / 100;
  const totalInterest = yearlyInterest * tenure;
  const maturityAmount = depositAmount + totalInterest;

  // Year-wise breakdown
  const yearlyBreakdown = Array.from({ length: tenure }, (_, i) => {
    const year = i + 1;
    const interestEarned = yearlyInterest * year;
    return { year, quarterlyPayout: quarterlyInterest, yearlyInterest, totalInterest: interestEarned };
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
              <h1 className="text-2xl font-bold text-primary">SCSS Calculator</h1>
              <p className="text-sm text-muted-foreground">Senior Citizen Savings Scheme</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                SCSS Details
              </CardTitle>
              <CardDescription>For citizens aged 60+ (or 55+ for retired)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="depositAmount">Deposit Amount (₹)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Math.min(3000000, Number(e.target.value)))}
                  min={1000}
                  max={3000000}
                />
                <p className="text-xs text-muted-foreground">Max limit: ₹30 lakh per individual</p>
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
                <p className="text-xs text-muted-foreground">Current rate: 8.2% (Jan-Mar 2024)</p>
              </div>
              <div className="space-y-2">
                <Label>Lock-in Period</Label>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-semibold">5 Years (Fixed)</p>
                  <p className="text-xs text-muted-foreground">Can be extended for 3 more years</p>
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <p className="text-sm font-medium text-amber-600 flex items-center gap-2">
                  <Info className="h-4 w-4" /> Key Features
                </p>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                  <li>• Quarterly interest payout</li>
                  <li>• Section 80C benefit up to ₹1.5 lakh</li>
                  <li>• TDS applicable if interest &gt; ₹50,000/year</li>
                  <li>• Premature withdrawal after 1 year</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle>SCSS Earnings Summary</CardTitle>
              <CardDescription>Your guaranteed returns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-card rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Total Earnings (5 Years)</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(totalInterest)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-card rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Quarterly Payout</p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(quarterlyInterest)}</p>
                </div>
                <div className="text-center p-4 bg-card rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Yearly Income</p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(yearlyInterest)}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Payout Schedule</p>
                <div className="space-y-2">
                  {yearlyBreakdown.map((item) => (
                    <div key={item.year} className="flex justify-between items-center p-2 bg-card rounded border text-sm">
                      <span>Year {item.year}</span>
                      <div className="text-right">
                        <span className="font-medium text-green-600">{formatCurrency(item.yearlyInterest)}</span>
                        <span className="text-xs text-muted-foreground ml-1">({formatCurrency(item.quarterlyPayout)}/qtr)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-card rounded-lg border">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Maturity Value</span>
                  <span className="text-xl font-bold">{formatCurrency(maturityAmount)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">(Principal + Total Interest)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto mt-6 flex gap-4 justify-center">
          <Button variant="outline" onClick={() => window.open("https://groww.in/calculators/scss-calculator", "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" /> Groww SCSS Calc
          </Button>
          <Button variant="outline" onClick={() => window.open("https://cleartax.in/s/scss-senior-citizen-saving-scheme", "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" /> ClearTax SCSS Info
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SCSSCalculator;
