import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, TrendingUp, ExternalLink, Info, AlertTriangle } from "lucide-react";
import Footer from "@/components/Footer";

const ELSSCalculator = () => {
  const navigate = useNavigate();
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(10000);
  const [investmentYears, setInvestmentYears] = useState<number>(10);
  const [expectedReturn, setExpectedReturn] = useState<number>(12);
  const [taxBracket, setTaxBracket] = useState<number>(30);

  const lockInPeriod = 3;
  const totalMonths = investmentYears * 12;
  const monthlyRate = expectedReturn / 100 / 12;

  // SIP maturity calculation
  const maturityAmount = monthlyInvestment * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
  const totalInvested = monthlyInvestment * totalMonths;
  const totalReturns = maturityAmount - totalInvested;

  // Tax savings under 80C (max 1.5L per year)
  const yearlyInvestment = Math.min(monthlyInvestment * 12, 150000);
  const yearlyTaxSaved = yearlyInvestment * (taxBracket / 100);
  const totalTaxSaved = yearlyTaxSaved * investmentYears;

  // LTCG calculation (10% on gains > 1L)
  const taxableGains = Math.max(0, totalReturns - 100000);
  const ltcgTax = taxableGains * 0.10;
  const netReturns = maturityAmount - ltcgTax;

  // Year-wise breakdown with lock-in status
  const yearlyBreakdown = Array.from({ length: investmentYears }, (_, i) => {
    const year = i + 1;
    const months = year * 12;
    const value = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const invested = monthlyInvestment * months;
    const isLocked = year < lockInPeriod;
    return { year, value, invested, isLocked };
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
              <h1 className="text-2xl font-bold text-primary">ELSS Calculator</h1>
              <p className="text-sm text-muted-foreground">Equity Linked Savings Scheme</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Investment Details
              </CardTitle>
              <CardDescription>Tax-saving mutual fund with 3-year lock-in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyInvestment">Monthly SIP (₹)</Label>
                <Input
                  id="monthlyInvestment"
                  type="number"
                  value={monthlyInvestment}
                  onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                  min={500}
                />
                <p className="text-xs text-muted-foreground">
                  Yearly: {formatCurrency(monthlyInvestment * 12)}
                  {monthlyInvestment * 12 > 150000 && " (80C limit: ₹1.5L)"}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Investment Period: {investmentYears} years</Label>
                <Slider
                  value={[investmentYears]}
                  onValueChange={(v) => setInvestmentYears(v[0])}
                  min={3}
                  max={30}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>3 years (min lock-in)</span>
                  <span>30 years</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Expected Return: {expectedReturn}% p.a.</Label>
                <Slider
                  value={[expectedReturn]}
                  onValueChange={(v) => setExpectedReturn(v[0])}
                  min={8}
                  max={20}
                  step={0.5}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>8% (Conservative)</span>
                  <span>20% (Aggressive)</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxBracket">Your Tax Bracket (%)</Label>
                <Input
                  id="taxBracket"
                  type="number"
                  value={taxBracket}
                  onChange={(e) => setTaxBracket(Number(e.target.value))}
                  min={0}
                  max={30}
                />
                <p className="text-xs text-muted-foreground">5%, 20%, or 30% as per old regime</p>
              </div>

              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-sm font-medium text-green-600 flex items-center gap-2">
                  <Info className="h-4 w-4" /> ELSS Benefits
                </p>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                  <li>• Shortest lock-in (3 years) among 80C options</li>
                  <li>• Tax deduction up to ₹1.5 lakh under Section 80C</li>
                  <li>• Potential for higher returns (equity-linked)</li>
                  <li>• LTCG tax: 10% on gains above ₹1 lakh</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle>ELSS Returns Summary</CardTitle>
              <CardDescription>Estimated wealth creation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-card rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Maturity Value</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(maturityAmount)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-card rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Total Invested</p>
                  <p className="text-lg font-semibold">{formatCurrency(totalInvested)}</p>
                </div>
                <div className="text-center p-4 bg-card rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Total Returns</p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(totalReturns)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="text-xs text-muted-foreground mb-1">Total Tax Saved (80C)</p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(totalTaxSaved)}</p>
                </div>
                <div className="text-center p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <p className="text-xs text-muted-foreground mb-1">LTCG Tax (est.)</p>
                  <p className="text-lg font-semibold text-amber-600">{formatCurrency(ltcgTax)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Year-wise Growth (Lock-in Status)</p>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {yearlyBreakdown.slice(0, 5).map((item) => (
                    <div key={item.year} className="flex justify-between items-center p-2 bg-card rounded border text-sm">
                      <div className="flex items-center gap-2">
                        <span>Year {item.year}</span>
                        {item.isLocked && (
                          <span className="px-1.5 py-0.5 bg-red-500/20 text-red-500 text-xs rounded">Locked</span>
                        )}
                      </div>
                      <span className="font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-600">Market Risk</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ELSS funds invest in equities and returns are subject to market risks. Past performance does not guarantee future returns.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto mt-6 flex gap-4 justify-center">
          <Button variant="outline" onClick={() => window.open("https://groww.in/calculators/elss-calculator", "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" /> Groww ELSS Calc
          </Button>
          <Button variant="outline" onClick={() => window.open("https://cleartax.in/s/elss-calculator", "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" /> ClearTax ELSS Calc
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ELSSCalculator;
