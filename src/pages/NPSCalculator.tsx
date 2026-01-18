import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, TrendingUp, ExternalLink } from "lucide-react";
import Footer from "@/components/Footer";

const NPSCalculator = () => {
  const navigate = useNavigate();
  const [monthlyContribution, setMonthlyContribution] = useState<number>(5000);
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [retirementAge, setRetirementAge] = useState<number>(60);
  const [expectedReturn, setExpectedReturn] = useState<number>(10);
  const [annuityRate, setAnnuityRate] = useState<number>(40);

  const years = retirementAge - currentAge;
  const months = years * 12;
  const monthlyRate = expectedReturn / 100 / 12;
  
  const totalCorpus = monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  const totalInvested = monthlyContribution * months;
  const totalReturns = totalCorpus - totalInvested;
  const annuityAmount = totalCorpus * (annuityRate / 100);
  const lumpsum = totalCorpus - annuityAmount;

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
              <h1 className="text-2xl font-bold text-primary">NPS Calculator</h1>
              <p className="text-sm text-muted-foreground">National Pension Scheme Returns</p>
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
                NPS Details
              </CardTitle>
              <CardDescription>Enter your NPS contribution details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyContribution">Monthly Contribution (₹)</Label>
                <Input
                  id="monthlyContribution"
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  min={500}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentAge">Current Age (Years)</Label>
                <Input
                  id="currentAge"
                  type="number"
                  value={currentAge}
                  onChange={(e) => setCurrentAge(Number(e.target.value))}
                  min={18}
                  max={65}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retirementAge">Retirement Age (Years)</Label>
                <Input
                  id="retirementAge"
                  type="number"
                  value={retirementAge}
                  onChange={(e) => setRetirementAge(Number(e.target.value))}
                  min={60}
                  max={75}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedReturn">Expected Return Rate (%)</Label>
                <Input
                  id="expectedReturn"
                  type="number"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  min={1}
                  max={15}
                  step={0.1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="annuityRate">Annuity Purchase Rate (%)</Label>
                <Input
                  id="annuityRate"
                  type="number"
                  value={annuityRate}
                  onChange={(e) => setAnnuityRate(Number(e.target.value))}
                  min={40}
                  max={100}
                />
                <p className="text-xs text-muted-foreground">Minimum 40% must be used for annuity</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle>NPS Maturity Summary</CardTitle>
              <CardDescription>Your estimated pension corpus</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-card rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Total Corpus at Retirement</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(totalCorpus)}</p>
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
                <div className="text-center p-4 bg-card rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Lumpsum ({100 - annuityRate}%)</p>
                  <p className="text-lg font-semibold">{formatCurrency(lumpsum)}</p>
                </div>
                <div className="text-center p-4 bg-card rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Annuity ({annuityRate}%)</p>
                  <p className="text-lg font-semibold">{formatCurrency(annuityAmount)}</p>
                </div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Investment Period: <span className="font-semibold">{years} years</span></p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto mt-6 flex gap-4 justify-center">
          <Button variant="outline" onClick={() => window.open("https://groww.in/calculators/nps-calculator", "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" /> Groww NPS Calc
          </Button>
          <Button variant="outline" onClick={() => window.open("https://cleartax.in/s/nps-calculator", "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" /> ClearTax NPS Calc
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NPSCalculator;
