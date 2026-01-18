import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ExternalLink, Coins, TrendingUp, Wallet } from "lucide-react";
import Footer from "@/components/Footer";

const LumpsumCalculator = () => {
  const navigate = useNavigate();
  const [investment, setInvestment] = useState<number>(500000);
  const [expectedReturn, setExpectedReturn] = useState<number>(12);
  const [duration, setDuration] = useState<number>(10);

  // Lumpsum Calculation: FV = PV * (1 + r)^n
  const r = expectedReturn / 100;
  const futureValue = investment * Math.pow(1 + r, duration);
  const totalReturns = futureValue - investment;
  const absoluteReturns = ((futureValue - investment) / investment) * 100;

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
              <h1 className="text-2xl font-bold text-primary">Lumpsum Calculator</h1>
              <p className="text-sm text-muted-foreground">Calculate returns on one-time investments</p>
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
                <Coins className="w-5 h-5 text-primary" />
                Investment Details
              </CardTitle>
              <CardDescription>Enter your lumpsum investment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label htmlFor="investment">Investment Amount (₹)</Label>
                  <span className="text-sm font-medium text-primary">{formatCurrency(investment)}</span>
                </div>
                <Input
                  id="investment"
                  type="number"
                  value={investment}
                  onChange={(e) => setInvestment(Number(e.target.value))}
                  className="mb-2"
                />
                <Slider
                  value={[investment]}
                  onValueChange={(value) => setInvestment(value[0])}
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
                  <Label htmlFor="expectedReturn">Expected Return (% p.a.)</Label>
                  <span className="text-sm font-medium text-primary">{expectedReturn}%</span>
                </div>
                <Input
                  id="expectedReturn"
                  type="number"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  step="0.5"
                  className="mb-2"
                />
                <Slider
                  value={[expectedReturn]}
                  onValueChange={(value) => setExpectedReturn(value[0])}
                  min={1}
                  max={30}
                  step={0.5}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1%</span>
                  <span>30%</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label htmlFor="duration">Investment Duration (Years)</Label>
                  <span className="text-sm font-medium text-primary">{duration} years</span>
                </div>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="mb-2"
                />
                <Slider
                  value={[duration]}
                  onValueChange={(value) => setDuration(value[0])}
                  min={1}
                  max={30}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 year</span>
                  <span>30 years</span>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Tip:</strong> Lumpsum investments work best for long-term goals. 
                  The power of compounding grows exponentially over time.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Result Section */}
          <div className="space-y-6">
            <Card className="shadow-lg bg-gradient-to-br from-primary/10 to-accent/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Future Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary mb-2">
                  {formatCurrency(futureValue)}
                </div>
                <p className="text-muted-foreground">
                  After {duration} years at {expectedReturn}% p.a.
                </p>
                <div className="mt-4 text-sm">
                  <span className="text-green-600 font-medium">
                    +{absoluteReturns.toFixed(1)}% absolute returns
                  </span>
                </div>
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
                  <span className="text-muted-foreground">Investment Amount</span>
                  <span className="font-semibold">{formatCurrency(investment)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                  <span className="text-muted-foreground">Total Returns</span>
                  <span className="font-semibold text-green-600">{formatCurrency(totalReturns)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                  <span className="text-muted-foreground">Future Value</span>
                  <span className="font-bold text-primary">{formatCurrency(futureValue)}</span>
                </div>

                {/* Year-wise growth */}
                <div className="mt-4">
                  <h4 className="font-medium mb-3">Year-wise Growth</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {Array.from({ length: Math.min(duration, 10) }, (_, i) => {
                      const year = i + 1;
                      const value = investment * Math.pow(1 + r, year);
                      return (
                        <div key={year} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Year {year}</span>
                          <span>{formatCurrency(value)}</span>
                        </div>
                      );
                    })}
                    {duration > 10 && (
                      <div className="text-xs text-muted-foreground text-center">
                        ... and {duration - 10} more years
                      </div>
                    )}
                  </div>
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
                  onClick={() => window.open("https://groww.in/calculators/lumpsum-calculator", "_blank")}
                >
                  Groww's Lumpsum Calculator
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => window.open("https://cleartax.in/s/lumpsum-calculator", "_blank")}
                >
                  ClearTax's Lumpsum Calculator
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

export default LumpsumCalculator;
