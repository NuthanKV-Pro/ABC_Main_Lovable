import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Scale, Info } from "lucide-react";
import Footer from "@/components/Footer";

interface InvestmentOption {
  name: string;
  rate: number;
  lockIn: string;
  risk: string;
  taxOnReturns: string;
  liquidity: string;
}

const TaxSavingComparison = () => {
  const navigate = useNavigate();
  const [investmentAmount, setInvestmentAmount] = useState<number>(150000);
  const [duration, setDuration] = useState<number>(5);
  const [taxBracket, setTaxBracket] = useState<number>(30);

  const investments: InvestmentOption[] = [
    { name: "PPF", rate: 7.1, lockIn: "15 years", risk: "Zero", taxOnReturns: "Tax-free", liquidity: "Low" },
    { name: "NPS", rate: 10, lockIn: "Till 60", risk: "Low-Medium", taxOnReturns: "Partial tax", liquidity: "Very Low" },
    { name: "NSC", rate: 7.7, lockIn: "5 years", risk: "Zero", taxOnReturns: "Taxable", liquidity: "Low" },
    { name: "Tax Saver FD", rate: 7.0, lockIn: "5 years", risk: "Zero", taxOnReturns: "Taxable", liquidity: "Low" },
    { name: "ELSS", rate: 12, lockIn: "3 years", risk: "High", taxOnReturns: "LTCG >1L", liquidity: "Medium" },
  ];

  const calculateReturns = (principal: number, rate: number, years: number) => {
    return principal * Math.pow(1 + rate / 100, years);
  };

  const calculateEffectiveReturn = (investment: InvestmentOption) => {
    const maturity = calculateReturns(investmentAmount, investment.rate, duration);
    const gains = maturity - investmentAmount;
    
    let taxOnGains = 0;
    if (investment.taxOnReturns === "Taxable") {
      taxOnGains = gains * (taxBracket / 100);
    } else if (investment.taxOnReturns === "LTCG >1L") {
      const taxableGains = Math.max(0, gains - 100000);
      taxOnGains = taxableGains * 0.10;
    } else if (investment.taxOnReturns === "Partial tax") {
      // 60% of corpus is taxable on withdrawal for NPS
      taxOnGains = gains * 0.6 * (taxBracket / 100);
    }
    
    const netReturns = maturity - taxOnGains;
    const taxSaved = investmentAmount * (taxBracket / 100);
    const effectiveReturn = ((netReturns + taxSaved - investmentAmount) / investmentAmount) * 100 / duration;
    
    return {
      maturity,
      gains,
      taxOnGains,
      netReturns,
      taxSaved,
      effectiveReturn
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const results = investments.map(inv => ({
    ...inv,
    ...calculateEffectiveReturn(inv)
  })).sort((a, b) => b.effectiveReturn - a.effectiveReturn);

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Tax Saving Comparison</h1>
              <p className="text-sm text-muted-foreground">Compare 80C investments side by side</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Investment Parameters
              </CardTitle>
              <CardDescription>Configure your investment scenario</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Investment Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                    max={150000}
                  />
                  <p className="text-xs text-muted-foreground">Max 80C limit: ₹1,50,000</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Investment Duration (Years)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min={1}
                    max={30}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxBracket">Tax Bracket (%)</Label>
                  <Input
                    id="taxBracket"
                    type="number"
                    value={taxBracket}
                    onChange={(e) => setTaxBracket(Number(e.target.value))}
                    min={0}
                    max={30}
                  />
                  <p className="text-xs text-muted-foreground">5%, 20%, or 30%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-primary">Section 80C Tax Benefit</p>
              <p className="text-sm text-muted-foreground">
                Tax saved on ₹{investmentAmount.toLocaleString('en-IN')} investment: <span className="font-semibold text-green-600">{formatCurrency(investmentAmount * taxBracket / 100)}</span>
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {results.map((inv, index) => (
              <Card key={inv.name} className={index === 0 ? "border-2 border-primary/50 bg-gradient-to-r from-primary/5 to-accent/5" : ""}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {index === 0 && (
                        <div className="px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded">
                          BEST
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold">{inv.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {inv.rate}% p.a. • Lock-in: {inv.lockIn} • Risk: {inv.risk}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Maturity</p>
                        <p className="font-semibold">{formatCurrency(inv.maturity)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tax on Returns</p>
                        <p className="font-semibold text-red-500">{formatCurrency(inv.taxOnGains)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Net Returns</p>
                        <p className="font-semibold text-green-600">{formatCurrency(inv.netReturns)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Effective Return</p>
                        <p className="font-bold text-primary text-lg">{inv.effectiveReturn.toFixed(2)}% p.a.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${inv.taxOnReturns === "Tax-free" ? "bg-green-500/20 text-green-600" : "bg-amber-500/20 text-amber-600"}`}>
                      {inv.taxOnReturns}
                    </span>
                    <span className="px-2 py-1 rounded text-xs bg-muted text-muted-foreground">
                      Liquidity: {inv.liquidity}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-muted/30">
            <CardContent className="p-6">
              <h4 className="font-semibold mb-2">Disclaimer</h4>
              <p className="text-sm text-muted-foreground">
                Returns shown are indicative based on historical performance. ELSS returns are market-linked and can vary significantly. 
                Always consult a financial advisor before making investment decisions.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TaxSavingComparison;
